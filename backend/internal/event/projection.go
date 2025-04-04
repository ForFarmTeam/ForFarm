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
		"farm.created", "farm.updated", "farm.deleted",
		"weather.updated",
		"cropland.created", "cropland.updated", "cropland.deleted",
		"inventory.item.created", "inventory.item.updated", "inventory.item.deleted",
	}

	p.logger.Info("FarmAnalyticsProjection starting, subscribing to events", "types", eventTypes)

	var errs []error
	for _, eventType := range eventTypes {
		if err := p.eventSubscriber.Subscribe(ctx, eventType, p.handleEvent); err != nil {
			p.logger.Error("Failed to subscribe to event type", "type", eventType, "error", err)
			errs = append(errs, fmt.Errorf("failed to subscribe to %s: %w", eventType, err))
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	p.logger.Debug("Handling event in FarmAnalyticsProjection", "type", event.Type, "aggregate_id", event.AggregateID, "event_id", event.ID)

	farmID := event.AggregateID

	// Try to get farmID from payload if AggregateID is empty or potentially not the farmID (e.g., user events)
	if farmID == "" || event.Type == "inventory.item.created" || event.Type == "inventory.item.updated" || event.Type == "inventory.item.deleted" || event.Type == "cropland.created" || event.Type == "cropland.updated" || event.Type == "cropland.deleted" {
		payloadMap, ok := event.Payload.(map[string]interface{})
		if ok {
			if idVal, ok := payloadMap["farm_id"].(string); ok && idVal != "" {
				farmID = idVal
			} else if event.Type != "farm.deleted" && event.Type != "farm.created" {
				p.logger.Warn("Could not determine farm_id from event payload or AggregateID", "event_type", event.Type, "event_id", event.ID, "aggregate_id", event.AggregateID)
				return nil
			}
		} else if event.Type != "farm.deleted" && event.Type != "farm.created" {
			p.logger.Error("Event payload is not a map, cannot extract farm_id", "event_type", event.Type, "event_id", event.ID)
			return nil
		}
	}

	if farmID == "" && event.Type != "farm.deleted" {
		p.logger.Error("Cannot process event, missing farm_id", "event_type", event.Type, "event_id", event.ID, "aggregate_id", event.AggregateID)
		return nil
	}

	var err error
	switch event.Type {
	case "farm.created", "farm.updated":
		var farmData domain.Farm
		jsonData, _ := json.Marshal(event.Payload)
		if err = json.Unmarshal(jsonData, &farmData); err != nil {
			p.logger.Error("Failed to unmarshal farm data from event payload", "event_id", event.ID, "error", err)
			return nil
		}
		if farmData.UUID == "" {
			farmData.UUID = event.AggregateID
		}

		p.logger.Info("Processing farm event", "event_type", event.Type, "farm_id", farmData.UUID, "owner_id", farmData.OwnerID)
		err = p.repository.CreateOrUpdateFarmBaseData(ctx, &farmData)

	case "farm.deleted":
		farmID = event.AggregateID
		if farmID == "" {
			p.logger.Error("Cannot process farm.deleted event, missing farm_id in AggregateID", "event_id", event.ID)
			return nil
		}
		err = p.repository.DeleteFarmAnalytics(ctx, farmID)

	case "weather.updated":
		var weatherData domain.WeatherData
		jsonData, _ := json.Marshal(event.Payload)
		if err = json.Unmarshal(jsonData, &weatherData); err != nil {
			p.logger.Error("Failed to unmarshal weather data from event payload", "event_id", event.ID, "error", err)
			return nil
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
		return nil
	}

	p.logger.Debug("Successfully processed event and updated farm analytics", "event_type", event.Type, "farm_id", farmID)
	return nil
}
