package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/forfarm/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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

func (p *postgresFarmRepository) fetchCroplandsByFarmIDs(ctx context.Context, farmIDs []string) (map[string][]domain.Cropland, error) {
	if len(farmIDs) == 0 {
		return make(map[string][]domain.Cropland), nil
	}

	query := `
		SELECT uuid, name, status, priority, land_size, growth_stage, plant_id, farm_id, created_at, updated_at  
		FROM croplands  
		WHERE farm_id = ANY($1)`

	rows, err := p.conn.Query(ctx, query, farmIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	croplandsByFarmID := make(map[string][]domain.Cropland)
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

		croplandsByFarmID[c.FarmID] = append(croplandsByFarmID[c.FarmID], c)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return croplandsByFarmID, nil
}

func (p *postgresFarmRepository) GetAll(ctx context.Context) ([]domain.Farm, error) {
	// Query to select all farms, ordered by creation date for consistency
	query := `
        SELECT uuid, name, lat, lon, farm_type, total_size, created_at, updated_at, owner_id
        FROM farms
        ORDER BY created_at DESC`

	// Use the existing fetch method without specific arguments for filtering
	farms, err := p.fetch(ctx, query)
	if err != nil {
		return nil, err
	}
	if len(farms) == 0 {
		return []domain.Farm{}, nil // Return empty slice, not nil
	}

	// --- Fetch associated crops (optional but good for consistency) ---
	farmIDs := make([]string, 0, len(farms))
	farmMap := make(map[string]*domain.Farm, len(farms))
	for i := range farms {
		farmIDs = append(farmIDs, farms[i].UUID)
		farmMap[farms[i].UUID] = &farms[i]
	}

	croplandsByFarmID, err := p.fetchCroplandsByFarmIDs(ctx, farmIDs)
	if err != nil {
		// Log the warning but return the farms fetched so far
		// Depending on requirements, you might want to return the error instead
		println("Warning: Failed to fetch associated croplands during GetAll:", err.Error())
	} else {
		for farmID, croplands := range croplandsByFarmID {
			if farm, ok := farmMap[farmID]; ok {
				farm.Crops = croplands
			}
		}
	}
	// --- End Fetch associated crops ---

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
		if errors.Is(err, pgx.ErrNoRows) { // Check for pgx specific error
			return nil, domain.ErrNotFound
		}
		return nil, err // Return other errors
	}

	// Fetch associated crops (optional, depends if GetByID needs them)
	cropsMap, err := p.fetchCroplandsByFarmIDs(ctx, []string{f.UUID})
	if err != nil {
		println("Warning: Failed to fetch croplands for GetByID:", err.Error())
		// Decide whether to return the farm without crops or return the error
	} else if crops, ok := cropsMap[f.UUID]; ok {
		f.Crops = crops
	}

	return &f, nil
}

func (p *postgresFarmRepository) GetByOwnerID(ctx context.Context, ownerID string) ([]domain.Farm, error) {
	query := `
		SELECT uuid, name, lat, lon, farm_type, total_size, created_at, updated_at, owner_id
		FROM farms  
		WHERE owner_id = $1`

	farms, err := p.fetch(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	if len(farms) == 0 {
		return []domain.Farm{}, nil
	}

	farmIDs := make([]string, 0, len(farms))
	farmMap := make(map[string]*domain.Farm, len(farms))
	for i := range farms {
		farmIDs = append(farmIDs, farms[i].UUID)
		farmMap[farms[i].UUID] = &farms[i]
	}

	croplandsByFarmID, err := p.fetchCroplandsByFarmIDs(ctx, farmIDs)
	if err != nil {
		println("Warning: Failed to fetch croplands for farms:", err.Error())
		return farms, nil
	}

	for farmID, croplands := range croplandsByFarmID {
		if farm, ok := farmMap[farmID]; ok {
			farm.Crops = croplands
		}
	}

	return farms, nil
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
				"uuid":      f.UUID,
				"name":      f.Name,
				"lat":       f.Lat,
				"lon":       f.Lon,
				"location":  map[string]float64{"lat": f.Lat, "lon": f.Lon},
				"farmType":  f.FarmType,
				"totalSize": f.TotalSize,
				"ownerId":   f.OwnerID,
				"createdAt": f.CreatedAt,
				"updatedAt": f.UpdatedAt,
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
