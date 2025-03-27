package repository

import (
	"context"
	"strings"
	"time"

	"github.com/forfarm/backend/internal/domain"
	"github.com/google/uuid"
)

type postgresFarmRepository struct {
	conn           Connection
	eventPublisher domain.EventPublisher
}

func NewPostgresFarm(conn Connection) domain.FarmRepository {
	return &postgresFarmRepository{conn: conn}
}

func (p *postgresFarmRepository) SetEventPublisher(publisher domain.EventPublisher) {
	p.eventPublisher = publisher
}

func (p *postgresFarmRepository) fetch(ctx context.Context, query string, args ...interface{}) ([]domain.Farm, error) {
	rows, err := p.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var farms []domain.Farm
	for rows.Next() {
		var f domain.Farm
		// Order: uuid, name, lat, lon, farm_type, total_size, created_at, updated_at, owner_id
		if err := rows.Scan(
			&f.UUID,
			&f.Name,
			&f.Lat,
			&f.Lon,
			&f.FarmType,
			&f.TotalSize,
			&f.CreatedAt,
			&f.UpdatedAt,
			&f.OwnerID,
		); err != nil {
			return nil, err
		}
		farms = append(farms, f)
	}
	return farms, nil
}

func (p *postgresFarmRepository) GetByID(ctx context.Context, farmId string) (*domain.Farm, error) {
	query := `
		SELECT uuid, name, lat, lon, farm_type, total_size, created_at, updated_at, owner_id
		FROM farms
		WHERE uuid = $1`
	var f domain.Farm
	err := p.conn.QueryRow(ctx, query, farmId).Scan(
		&f.UUID,
		&f.Name,
		&f.Lat,
		&f.Lon,
		&f.FarmType,
		&f.TotalSize,
		&f.CreatedAt,
		&f.UpdatedAt,
		&f.OwnerID,
	)
	if err != nil {
		return nil, err
	}
	return &f, nil
}

func (p *postgresFarmRepository) GetByOwnerID(ctx context.Context, ownerID string) ([]domain.Farm, error) {
	query := `
		SELECT uuid, name, lat, lon, farm_type, total_size, created_at, updated_at, owner_id
		FROM farms
		WHERE owner_id = $1`
	return p.fetch(ctx, query, ownerID)
}

func (p *postgresFarmRepository) CreateOrUpdate(ctx context.Context, f *domain.Farm) error {
	isNew := strings.TrimSpace(f.UUID) == ""

	if isNew {
		f.UUID = uuid.New().String()
	}

	query := `
		INSERT INTO farms (uuid, name, lat, lon, farm_type, total_size, created_at, updated_at, owner_id)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
		ON CONFLICT (uuid) DO UPDATE
		SET name = EXCLUDED.name,
		    lat = EXCLUDED.lat,
		    lon = EXCLUDED.lon,
		    farm_type = EXCLUDED.farm_type,
		    total_size = EXCLUDED.total_size,
		    updated_at = NOW(),
		    owner_id = EXCLUDED.owner_id
		RETURNING uuid, created_at, updated_at`
	err := p.conn.QueryRow(ctx, query, f.UUID, f.Name, f.Lat, f.Lon, f.FarmType, f.TotalSize, f.OwnerID).
		Scan(&f.UUID, &f.CreatedAt, &f.UpdatedAt)

	if err != nil {
		return err
	}

	if p.eventPublisher != nil {
		eventType := "farm.updated"
		if isNew {
			eventType = "farm.created"
		}

		event := domain.Event{
			ID:          uuid.New().String(),
			Type:        eventType,
			Source:      "farm-repository",
			Timestamp:   time.Now(),
			AggregateID: f.UUID,
			Payload: map[string]interface{}{
				"farm_id":    f.UUID,
				"name":       f.Name,
				"location":   map[string]float64{"lat": f.Lat, "lon": f.Lon},
				"farm_type":  f.FarmType,
				"total_size": f.TotalSize,
				"owner_id":   f.OwnerID,
				"created_at": f.CreatedAt,
				"updated_at": f.UpdatedAt,
			},
		}

		go func() {
			bgCtx := context.Background()
			if err := p.eventPublisher.Publish(bgCtx, event); err != nil {
				println("Failed to publish event", err.Error())
			}
		}()
	}

	return nil
}

func (p *postgresFarmRepository) Delete(ctx context.Context, uuid string) error {
	query := `DELETE FROM farms WHERE uuid = $1`
	_, err := p.conn.Exec(ctx, query, uuid)
	return err
}
