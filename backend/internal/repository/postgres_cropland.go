package repository

import (
	"context"
	"strings"

	"github.com/google/uuid"

	"github.com/forfarm/backend/internal/domain"
)

type postgresCroplandRepository struct {
	conn Connection
}

func NewPostgresCropland(conn Connection) domain.CroplandRepository {
	return &postgresCroplandRepository{conn: conn}
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
			&c.UUID,
			&c.Name,
			&c.Status,
			&c.Priority,
			&c.LandSize,
			&c.GrowthStage,
			&c.PlantID,
			&c.FarmID,
			&c.CreatedAt,
			&c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		croplands = append(croplands, c)
	}
	return croplands, nil
}

func (p *postgresCroplandRepository) GetByID(ctx context.Context, uuid string) (domain.Cropland, error) {
	query := `
		SELECT uuid, name, status, priority, land_size, growth_stage, plant_id, farm_id, created_at, updated_at
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
		SELECT uuid, name, status, priority, land_size, growth_stage, plant_id, farm_id, created_at, updated_at
		FROM croplands
		WHERE farm_id = $1`

	return p.fetch(ctx, query, farmID)
}

func (p *postgresCroplandRepository) CreateOrUpdate(ctx context.Context, c *domain.Cropland) error {
	if strings.TrimSpace(c.UUID) == "" {
		c.UUID = uuid.New().String()
	}

	query := `  
		INSERT INTO croplands (uuid, name, status, priority, land_size, growth_stage, plant_id, farm_id, created_at, updated_at)  
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		ON CONFLICT (uuid) DO UPDATE
		SET name = EXCLUDED.name,
		    status = EXCLUDED.status,
		    priority = EXCLUDED.priority,
		    land_size = EXCLUDED.land_size,
		    growth_stage = EXCLUDED.growth_stage,
		    plant_id = EXCLUDED.plant_id,
		    farm_id = EXCLUDED.farm_id,
		    updated_at = NOW()
		RETURNING uuid, created_at, updated_at`

	return p.conn.QueryRow(
		ctx,
		query,
		c.UUID,
		c.Name,
		c.Status,
		c.Priority,
		c.LandSize,
		c.GrowthStage,
		c.PlantID,
		c.FarmID,
	).Scan(&c.CreatedAt, &c.UpdatedAt)
}

func (p *postgresCroplandRepository) Delete(ctx context.Context, uuid string) error {
	query := `DELETE FROM croplands WHERE uuid = $1`
	_, err := p.conn.Exec(ctx, query, uuid)
	return err
}
