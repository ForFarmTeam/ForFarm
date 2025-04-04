package repository

import (
	"context"
	"log/slog"
	"strings"
	"time"

	"github.com/forfarm/backend/internal/cache"
	"github.com/forfarm/backend/internal/domain"
	"github.com/google/uuid"
)

const (
	cacheKeyPlantsAll   = "plants:all"
	cacheKeyPlantPrefix = "plant:uuid:"
	cacheTTLStatic      = 1 * time.Hour // Cache static lists for 1 hour
)

type postgresPlantRepository struct {
	conn  Connection
	cache cache.Cache
}

func NewPostgresPlant(conn Connection, c cache.Cache) domain.PlantRepository {
	return &postgresPlantRepository{conn: conn, cache: c}
}

func (p *postgresPlantRepository) fetch(ctx context.Context, query string, args ...interface{}) ([]domain.Plant, error) {
	rows, err := p.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plants []domain.Plant
	for rows.Next() {
		var plant domain.Plant
		if err := rows.Scan(
			&plant.UUID, &plant.Name, &plant.Variety,
			&plant.RowSpacing, &plant.OptimalTemp, &plant.PlantingDepth,
			&plant.AverageHeight, &plant.LightProfileID, &plant.SoilConditionID,
			&plant.PlantingDetail, &plant.IsPerennial, &plant.DaysToEmerge,
			&plant.DaysToFlower, &plant.DaysToMaturity, &plant.HarvestWindow,
			&plant.PHValue, &plant.EstimateLossRate, &plant.EstimateRevenuePerHU,
			&plant.HarvestUnitID, &plant.WaterNeeds,
		); err != nil {
			return nil, err
		}
		plants = append(plants, plant)
	}
	return plants, nil
}

func (p *postgresPlantRepository) GetByUUID(ctx context.Context, uuid string) (domain.Plant, error) {
	// Check cache first
	cacheKey := cacheKeyPlantPrefix + uuid
	if cached, found := p.cache.Get(cacheKey); found {
		if plant, ok := cached.(domain.Plant); ok {
			slog.DebugContext(ctx, "Cache hit for GetPlantByUUID", "key", cacheKey)
			return plant, nil
		}
	}
	slog.DebugContext(ctx, "Cache miss for GetPlantByUUID", "key", cacheKey)

	query := `SELECT * FROM plants WHERE uuid = $1`
	plants, err := p.fetch(ctx, query, uuid)
	if err != nil {
		return domain.Plant{}, err
	}
	if len(plants) == 0 {
		return domain.Plant{}, domain.ErrNotFound
	}
	plant := plants[0]
	p.cache.Set(cacheKey, plant, cacheTTLStatic)
	return plant, nil
}

func (p *postgresPlantRepository) GetByName(ctx context.Context, name string) (domain.Plant, error) {
	query := `SELECT * FROM plants WHERE name = $1`
	plants, err := p.fetch(ctx, query, name)
	if err != nil || len(plants) == 0 {
		return domain.Plant{}, domain.ErrNotFound
	}
	return plants[0], nil
}

func (p *postgresPlantRepository) GetAll(ctx context.Context) ([]domain.Plant, error) {
	if cached, found := p.cache.Get(cacheKeyPlantsAll); found {
		if plants, ok := cached.([]domain.Plant); ok {
			slog.DebugContext(ctx, "Cache hit for GetAllPlants", "key", cacheKeyPlantsAll)
			return plants, nil
		}
	}
	slog.DebugContext(ctx, "Cache miss for GetAllPlants", "key", cacheKeyPlantsAll)

	query := `SELECT * FROM plants`
	plants, err := p.fetch(ctx, query)
	if err != nil {
		return nil, err
	}

	if len(plants) > 0 {
		p.cache.Set(cacheKeyPlantsAll, plants, cacheTTLStatic)
	}

	return plants, nil
}

func (p *postgresPlantRepository) Create(ctx context.Context, plant *domain.Plant) error {
	if strings.TrimSpace(plant.UUID) == "" {
		plant.UUID = uuid.New().String()
	}
	if err := plant.Validate(); err != nil {
		return err
	}
	query := `INSERT INTO plants (uuid, name, light_profile_id, soil_condition_id, harvest_unit_id, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING created_at, updated_at`
	err := p.conn.QueryRow(ctx, query, plant.UUID, plant.Name, plant.LightProfileID, plant.SoilConditionID, plant.HarvestUnitID).Scan(&plant.CreatedAt, &plant.UpdatedAt)

	if err == nil {
		p.cache.Delete(cacheKeyPlantsAll)
		slog.DebugContext(ctx, "Cache invalidated", "key", cacheKeyPlantsAll)
	}
	return err
}

func (p *postgresPlantRepository) Update(ctx context.Context, plant *domain.Plant) error {
	if err := plant.Validate(); err != nil {
		return err
	}
	query := `UPDATE plants SET name = $2, light_profile_id = $3, soil_condition_id = $4,
		harvest_unit_id = $5, updated_at = NOW() WHERE uuid = $1`
	_, err := p.conn.Exec(ctx, query, plant.UUID, plant.Name, plant.LightProfileID, plant.SoilConditionID, plant.HarvestUnitID)
	if err == nil {
		p.cache.Delete(cacheKeyPlantsAll)
		p.cache.Delete(cacheKeyPlantPrefix + plant.UUID)
		slog.DebugContext(ctx, "Cache invalidated", "keys", []string{cacheKeyPlantsAll, cacheKeyPlantPrefix + plant.UUID})
	}
	return err
}

func (p *postgresPlantRepository) Delete(ctx context.Context, uuid string) error {
	query := `DELETE FROM plants WHERE uuid = $1`
	_, err := p.conn.Exec(ctx, query, uuid)
	if err == nil {
		p.cache.Delete(cacheKeyPlantsAll)
		p.cache.Delete(cacheKeyPlantPrefix + uuid)
		slog.DebugContext(ctx, "Cache invalidated", "keys", []string{cacheKeyPlantsAll, cacheKeyPlantPrefix + uuid})
	}
	return err
}
