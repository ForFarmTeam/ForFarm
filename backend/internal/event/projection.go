// backend/internal/event/projection.go
package event

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/forfarm/backend/internal/domain"
)

type FarmAnalyticsProjection struct {
	eventSubscriber domain.EventSubscriber
	repository      domain.AnalyticsRepository
	logger          *slog.Logger
}

func NewFarmAnalyticsProjection(
	subscriber domain.EventSubscriber,
	repository domain.AnalyticsRepository,
	logger *slog.Logger,
) *FarmAnalyticsProjection {
	if logger == nil {
		logger = slog.Default()
	}
	return &FarmAnalyticsProjection{
		eventSubscriber: subscriber,
		repository:      repository,
		logger:          logger,
	}
}

func (p *FarmAnalyticsProjection) Start(ctx context.Context) error {
	eventTypes := []string{
		"farm.created", "farm.updated", "farm.deleted", // Farm lifecycle
		"weather.updated",                                          // Weather updates
		"cropland.created", "cropland.updated", "cropland.deleted", // Crop changes trigger count recalc
		"inventory.item.created", "inventory.item.updated", "inventory.item.deleted", // Inventory changes trigger timestamp update
		// Add other events that might influence FarmAnalytics, e.g., "pest.detected", "yield.recorded"
	}

	p.logger.Info("FarmAnalyticsProjection starting, subscribing to events", "types", eventTypes)

	var errs []error
	for _, eventType := range eventTypes {
		if err := p.eventSubscriber.Subscribe(ctx, eventType, p.handleEvent); err != nil {
			p.logger.Error("Failed to subscribe to event type", "type", eventType, "error", err)
			errs = append(errs, fmt.Errorf("failed to subscribe to %s: %w", eventType, err))
			// TODO: Decide if we should continue subscribing or fail hard
			// return errors.Join(errs...) // Fail hard
		} else {
			p.logger.Info("Successfully subscribed to event type", "type", eventType)
		}
	}

	if len(errs) > 0 {
		return errors.Join(errs...)
	}

	p.logger.Info("FarmAnalyticsProjection started successfully")
	return nil
}

func (p *FarmAnalyticsProjection) handleEvent(event domain.Event) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second) // 10-second timeout
	defer cancel()

	p.logger.Debug("Handling event in FarmAnalyticsProjection", "type", event.Type, "aggregate_id", event.AggregateID, "event_id", event.ID)

	farmID := event.AggregateID // Assume AggregateID is the Farm UUID for relevant events

	// Special case: inventory events might use UserID as AggregateID.
	// Need a way to map UserID to FarmID if necessary, or adjust event publishing.
	// For now, we assume farmID can be derived or is directly in the payload for inventory events.

	if farmID == "" {
		payloadMap, ok := event.Payload.(map[string]interface{})
		if ok {
			if idVal, ok := payloadMap["farm_id"].(string); ok && idVal != "" {
				farmID = idVal
			} else if idVal, ok := payloadMap["user_id"].(string); ok && idVal != "" {
				// !! WARNING: Need mapping from user_id to farm_id here !!
				// This is a temp - requires adding userRepo or similar lookup
				p.logger.Warn("Inventory event received without direct farm_id, cannot update stats", "event_id", event.ID, "user_id", idVal)
				// Skip inventory stats update if farm_id is missing
				return nil
			}
		}
	}

	if farmID == "" && event.Type != "farm.deleted" { // farm.deleted uses AggregateID which is the farmID being deleted
		p.logger.Error("Cannot process event, missing farm_id", "event_type", event.Type, "event_id", event.ID, "aggregate_id", event.AggregateID)
		return nil
	}

	var err error
	switch event.Type {
	case "farm.created", "farm.updated":
		// Need to get the full Farm domain object from the payload
		var farmData domain.Farm
		jsonData, _ := json.Marshal(event.Payload) // Convert payload map back to JSON
		if err = json.Unmarshal(jsonData, &farmData); err != nil {
			p.logger.Error("Failed to unmarshal farm data from event payload", "event_id", event.ID, "error", err)
			// Nack or Ack based on error strategy? Ack for now.
			return nil
		}
		// Ensure UUID is set from AggregateID if missing in payload itself
		if farmData.UUID == "" {
			farmData.UUID = event.AggregateID
		}
		err = p.repository.CreateOrUpdateFarmBaseData(ctx, &farmData)

	case "farm.deleted":
		farmID = event.AggregateID // Use AggregateID directly for delete
		if farmID == "" {
			p.logger.Error("Cannot process farm.deleted event, missing farm_id in AggregateID", "event_id", event.ID)
			return nil
		}
		err = p.repository.DeleteFarmAnalytics(ctx, farmID)

	case "weather.updated":
		// Extract weather data from payload
		var weatherData domain.WeatherData
		jsonData, _ := json.Marshal(event.Payload)
		if err = json.Unmarshal(jsonData, &weatherData); err != nil {
			p.logger.Error("Failed to unmarshal weather data from event payload", "event_id", event.ID, "error", err)
			return nil // Acknowledge bad data
		}
		err = p.repository.UpdateFarmAnalyticsWeather(ctx, farmID, &weatherData)

	case "cropland.created", "cropland.updated", "cropland.deleted":
		payloadMap, ok := event.Payload.(map[string]interface{})
		if !ok {
			p.logger.Error("Failed to cast cropland event payload to map", "event_id", event.ID)
			return nil
		}
		idVal, ok := payloadMap["farm_id"].(string)
		if !ok || idVal == "" {
			p.logger.Error("Missing farm_id in cropland event payload", "event_id", event.ID, "event_type", event.Type)
			return nil
		}
		farmID = idVal
		err = p.repository.UpdateFarmAnalyticsCropStats(ctx, farmID)

	case "inventory.item.created", "inventory.item.updated", "inventory.item.deleted":
		// farmID needs to be looked up or present in payload
		// For now, we only touch the timestamp
		if farmID != "" {
			err = p.repository.UpdateFarmAnalyticsInventoryStats(ctx, farmID)
		} else {
			p.logger.Warn("Skipping inventory stats update due to missing farm_id", "event_id", event.ID)
			return nil
		}

	default:
		p.logger.Warn("Received unhandled event type", "type", event.Type, "event_id", event.ID)
		return nil
	}

	if err != nil {
		p.logger.Error("Failed to update farm analytics", "event_type", event.Type, "farm_id", farmID, "error", err)
		// Decide whether to return the error (potentially causing requeue) or nil (ack)
		return nil
	}

	p.logger.Debug("Successfully processed event and updated farm analytics", "event_type", event.Type, "farm_id", farmID)
	return nil
}
