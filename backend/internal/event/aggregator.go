package event

import (
	"context"
	"log/slog"
	"time"

	"github.com/forfarm/backend/internal/domain"
)

type EventAggregator struct {
	sourceSubscriber domain.EventSubscriber
	targetPublisher  domain.EventPublisher
	logger           *slog.Logger
}

func NewEventAggregator(
	sourceSubscriber domain.EventSubscriber,
	targetPublisher domain.EventPublisher,
	logger *slog.Logger,
) *EventAggregator {
	return &EventAggregator{
		sourceSubscriber: sourceSubscriber,
		targetPublisher:  targetPublisher,
		logger:           logger,
	}
}

func (a *EventAggregator) Start(ctx context.Context) error {
	// Subscribe to fine-grained events
	eventTypes := []string{
		"farm.created", "farm.updated", "farm.deleted",
		"weather.updated", "inventory.changed", "marketplace.transaction",
	}

	for _, eventType := range eventTypes {
		if err := a.sourceSubscriber.Subscribe(ctx, eventType, a.handleEvent); err != nil {
			return err
		}
	}

	return nil
}

func (a *EventAggregator) handleEvent(event domain.Event) error {
	// Logic to aggregate events
	// For example, combine farm and weather events into a farm status event

	if event.Type == "farm.created" || event.Type == "farm.updated" {
		// Create a coarse-grained event
		aggregatedEvent := domain.Event{
			ID:          event.ID,
			Type:        "farm.status_changed",
			Source:      "event-aggregator",
			Timestamp:   time.Now(),
			Payload:     event.Payload,
			AggregateID: event.AggregateID,
		}

		return a.targetPublisher.Publish(context.Background(), aggregatedEvent)
	}

	return nil
}
