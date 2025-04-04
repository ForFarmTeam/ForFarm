package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/forfarm/backend/internal/domain"
)

type postgresCroplandRepository struct {
	conn           Connection
	eventPublisher domain.EventPublisher
}

func NewPostgresCropland(conn Connection) domain.CroplandRepository {
	return &postgresCroplandRepository{conn: conn}
}

func (p *postgresCroplandRepository) SetEventPublisher(publisher domain.EventPublisher) {
	p.eventPublisher = publisher
}

func (p *postgresCroplandRepository) fetch(ctx context.Context, query string, args ...interface{}) ([]domain.Cropland, error) {
	rows, err := p.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var croplands []domain.Cropland
	for rows.Next() {
		var c domain.Cropland
		if err := rows.Scan(
			&c.UUID, &c.Name, &c.Status, &c.Priority, &c.LandSize,
			&c.GrowthStage, &c.PlantID, &c.FarmID, &c.GeoFeature,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		croplands = append(croplands, c)
	}
	return croplands, nil
}

func (p *postgresCroplandRepository) GetAll(ctx context.Context) ([]domain.Cropland, error) {
	query := `
		SELECT uuid, name, status, priority, land_size, growth_stage, plant_id, farm_id, geo_feature, created_at, updated_at
		FROM croplands`

	return p.fetch(ctx, query)
}

func (p *postgresCroplandRepository) GetByID(ctx context.Context, uuid string) (domain.Cropland, error) {
	query := `
		SELECT uuid, name, status, priority, land_size, growth_stage, plant_id, farm_id, geo_feature, created_at, updated_at
		FROM croplands
		WHERE uuid = $1`

	croplands, err := p.fetch(ctx, query, uuid)
	if err != nil {
		return domain.Cropland{}, err
	}
	if len(croplands) == 0 {
		return domain.Cropland{}, domain.ErrNotFound
	}
	return croplands[0], nil
}

func (p *postgresCroplandRepository) GetByFarmID(ctx context.Context, farmID string) ([]domain.Cropland, error) {
	query := `
		SELECT uuid, name, status, priority, land_size, growth_stage, plant_id, farm_id, geo_feature, created_at, updated_at
		FROM croplands
		WHERE farm_id = $1`

	return p.fetch(ctx, query, farmID)
}

func (p *postgresCroplandRepository) CreateOrUpdate(ctx context.Context, c *domain.Cropland) error {
	isNew := false
	if strings.TrimSpace(c.UUID) == "" {
		c.UUID = uuid.NewString()
		isNew = true
	}

	if c.GeoFeature != nil && len(c.GeoFeature) == 0 {
		c.GeoFeature = nil
	}

	query := `
	INSERT INTO croplands (
		uuid, name, status, priority, land_size, growth_stage,
		plant_id, farm_id, geo_feature, created_at, updated_at
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
	ON CONFLICT (uuid) DO UPDATE
	SET name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority,
		land_size = EXCLUDED.land_size, growth_stage = EXCLUDED.growth_stage,
		plant_id = EXCLUDED.plant_id, farm_id = EXCLUDED.farm_id,
		geo_feature = EXCLUDED.geo_feature, updated_at = NOW()
	RETURNING uuid, created_at, updated_at`

	err := p.conn.QueryRow(
		ctx, query,
		c.UUID, c.Name, c.Status, c.Priority, c.LandSize, c.GrowthStage,
		c.PlantID, c.FarmID, c.GeoFeature,
	).Scan(&c.UUID, &c.CreatedAt, &c.UpdatedAt)

	if err != nil {
		return err
	}

	if p.eventPublisher != nil {
		eventType := "cropland.updated"
		if isNew {
			eventType = "cropland.created"
		}

		// Avoid sending raw json.RawMessage directly if possible
		var geoFeatureMap interface{}
		if c.GeoFeature != nil {
			_ = json.Unmarshal(c.GeoFeature, &geoFeatureMap)
		}
		payload := map[string]interface{}{
			"uuid":        c.UUID,
			"name":        c.Name,
			"status":      c.Status,
			"priority":    c.Priority,
			"landSize":    c.LandSize,
			"growthStage": c.GrowthStage,
			"plantId":     c.PlantID,
			"farmId":      c.FarmID,
			"geoFeature":  geoFeatureMap,
			"createdAt":   c.CreatedAt,
			"updatedAt":   c.UpdatedAt,
			"event_type":  eventType,
		}

		event := domain.Event{
			ID:          uuid.NewString(),
			Type:        eventType,
			Source:      "cropland-repository",
			Timestamp:   time.Now().UTC(),
			AggregateID: c.UUID,
			Payload:     payload,
		}
		go func() {
			bgCtx := context.Background()
			if errPub := p.eventPublisher.Publish(bgCtx, event); errPub != nil {
				fmt.Printf("Error publishing %s event: %v\n", eventType, errPub) // Replace with proper logging
			}
		}()
	}

	return nil
}

func (p *postgresCroplandRepository) Delete(ctx context.Context, uuid string) error {
	// Optional: Fetch details before deleting if needed for event payload
	// cropland, err := p.GetByID(ctx, uuid) // Might fail if already deleted, handle carefully
	// if err != nil && !errors.Is(err, domain.ErrNotFound){ return err } // Return actual errors

	query := `DELETE FROM croplands WHERE uuid = $1`
	_, err := p.conn.Exec(ctx, query, uuid)
	if err != nil {
		return err
	}

	if p.eventPublisher != nil {
		eventType := "cropland.deleted"
		payload := map[string]interface{}{
			"crop_id": uuid,
			// Include farm_id if easily available or fetched before delete
			// "farm_id": cropland.FarmID
			"event_type": eventType,
		}
		event := domain.Event{
			ID:          uuid,
			Type:        eventType,
			Source:      "cropland-repository",
			Timestamp:   time.Now().UTC(),
			AggregateID: uuid,
			Payload:     payload,
		}
		go func() {
			bgCtx := context.Background()
			if errPub := p.eventPublisher.Publish(bgCtx, event); errPub != nil {
				fmt.Printf("Error publishing %s event: %v\n", eventType, errPub)
			}
		}()
	}

	return nil
}
