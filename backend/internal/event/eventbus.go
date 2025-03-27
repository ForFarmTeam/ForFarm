package event

import (
	"context"
	"encoding/json"
	"log/slog"

	"github.com/forfarm/backend/internal/domain"
	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQEventBus struct {
	conn    *amqp.Connection
	channel *amqp.Channel
	logger  *slog.Logger
}

func NewRabbitMQEventBus(url string, logger *slog.Logger) (*RabbitMQEventBus, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}

	// Declare the exchange
	err = ch.ExchangeDeclare(
		"events", // name
		"topic",  // type
		true,     // durable
		false,    // auto-deleted
		false,    // internal
		false,    // no-wait
		nil,      // arguments
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, err
	}

	return &RabbitMQEventBus{
		conn:    conn,
		channel: ch,
		logger:  logger,
	}, nil
}

func (r *RabbitMQEventBus) Publish(ctx context.Context, event domain.Event) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	return r.channel.PublishWithContext(
		ctx,
		"events",             // exchange
		"events."+event.Type, // routing key
		false,                // mandatory
		false,                // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         data,
			DeliveryMode: amqp.Persistent,
			MessageId:    event.ID,
			Timestamp:    event.Timestamp,
		},
	)
}

func (r *RabbitMQEventBus) Subscribe(ctx context.Context, eventType string, handler func(domain.Event) error) error {
	// Declare a queue for this consumer
	q, err := r.channel.QueueDeclare(
		"",    // name (empty = auto-generated)
		false, // durable
		true,  // delete when unused
		true,  // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return err
	}

	// Bind the queue to the exchange
	err = r.channel.QueueBind(
		q.Name,              // queue name
		"events."+eventType, // routing key
		"events",            // exchange
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		return err
	}

	// Start consuming
	msgs, err := r.channel.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		return err
	}

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-msgs:
				if !ok {
					return
				}

				var event domain.Event
				if err := json.Unmarshal(msg.Body, &event); err != nil {
					r.logger.Error("Failed to unmarshal event", "error", err)
					msg.Nack(false, false)
					continue
				}

				if err := handler(event); err != nil {
					r.logger.Error("Failed to handle event", "error", err)
					msg.Nack(false, true) // requeue
				} else {
					msg.Ack(false)
				}
			}
		}
	}()

	return nil
}

func (r *RabbitMQEventBus) Close() error {
	if err := r.channel.Close(); err != nil {
		return err
	}
	return r.conn.Close()
}
