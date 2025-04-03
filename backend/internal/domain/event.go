package domain

import (
	"context"
	"time"
)

type Event struct {
	ID          string
	Type        string
	Source      string
	Timestamp   time.Time
	Payload     interface{}
	AggregateID string
}

type EventPublisher interface {
	Publish(ctx context.Context, event Event) error
}

type EventSubscriber interface {
	Subscribe(ctx context.Context, eventType string, handler func(Event) error) error
}

type EventBus interface {
	EventPublisher
	EventSubscriber
}
