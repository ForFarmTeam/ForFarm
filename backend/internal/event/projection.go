package event

import (
	"context"
	"log/slog"

	"github.com/forfarm/backend/internal/domain"
)

type AnalyticsProjection struct {
	eventSubscriber domain.EventSubscriber
	repository      domain.AnalyticsRepository
	logger          *slog.Logger
}

func NewAnalyticsProjection(
	subscriber domain.EventSubscriber,
	repository domain.AnalyticsRepository,
	logger *slog.Logger,
) *AnalyticsProjection {
	return &AnalyticsProjection{
		eventSubscriber: subscriber,
		repository:      repository,
		logger:          logger,
	}
}

func (p *AnalyticsProjection) Start(ctx context.Context) error {
	// Subscribe to coarse-grained events
	eventTypes := []string{"farm.status_changed"}

	for _, eventType := range eventTypes {
		if err := p.eventSubscriber.Subscribe(ctx, eventType, p.handleEvent); err != nil {
			return err
		}
	}

	return nil
}

func (p *AnalyticsProjection) handleEvent(event domain.Event) error {
	// Update materialized view based on event
	if event.Type == "farm.status_changed" {
		return p.repository.SaveFarmAnalytics(context.Background(), event.AggregateID, event.Payload)
	}

	return nil
}
