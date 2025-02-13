package repository

import (
	"context"
	"github.com/forfarm/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"strings"
)

type postgresFarmRepository struct {
	conn Connection
}

func NewPostgresFarm(conn Connection) domain.FarmRepository {
	return &postgresFarmRepository{conn: conn}
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
		var plantTypes pq.StringArray
		if err := rows.Scan(
			&f.UUID,
			&f.Name,
			&f.Lat,
			&f.Lon,
			&f.CreatedAt,
			&f.UpdatedAt,
			&f.OwnerID,
			&plantTypes,
		); err != nil {
			return nil, err
		}

		for _, plantTypeStr := range plantTypes {
			plantTypeUUID, err := uuid.Parse(plantTypeStr)
			if err != nil {
				return nil, err
			}
			f.PlantTypes = append(f.PlantTypes, plantTypeUUID)
		}

		farms = append(farms, f)
	}
	return farms, nil
}

func (p *postgresFarmRepository) GetByID(ctx context.Context, uuid string) (domain.Farm, error) {
	query := `
		SELECT uuid, name, lat, lon, created_at, updated_at, owner_id, plant_types
		FROM farms
		WHERE uuid = $1`

	farms, err := p.fetch(ctx, query, uuid)
	if err != nil {
		return domain.Farm{}, err
	}
	if len(farms) == 0 {
		return domain.Farm{}, domain.ErrNotFound
	}
	return farms[0], nil
}

func (p *postgresFarmRepository) GetByOwnerID(ctx context.Context, ownerID string) ([]domain.Farm, error) {
	query := `
		SELECT uuid, name, lat, lon, created_at, updated_at, owner_id, plant_types
		FROM farms
		WHERE owner_id = $1`

	return p.fetch(ctx, query, ownerID)
}

func (p *postgresFarmRepository) CreateOrUpdate(ctx context.Context, f *domain.Farm) error {
	if strings.TrimSpace(f.UUID) == "" {
		f.UUID = uuid.New().String()
	}

	plantTypes := make([]string, len(f.PlantTypes))
	for i, pt := range f.PlantTypes {
		plantTypes[i] = pt.String()
	}

	query := `  
		INSERT INTO farms (uuid, name, lat, lon, created_at, updated_at, owner_id, plant_types)  
		VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, $6)
		ON CONFLICT (uuid) DO UPDATE
		SET name = EXCLUDED.name,
		    lat = EXCLUDED.lat,
		    lon = EXCLUDED.lon,
		    updated_at = NOW(),
		    owner_id = EXCLUDED.owner_id,
		    plant_types = EXCLUDED.plant_types
		RETURNING uuid, created_at, updated_at`

	return p.conn.QueryRow(
		ctx,
		query,
		f.UUID,
		f.Name,
		f.Lat,
		f.Lon,
		f.OwnerID,
		pq.StringArray(plantTypes),
	).Scan(&f.UUID, &f.CreatedAt, &f.UpdatedAt)
}

func (p *postgresFarmRepository) Delete(ctx context.Context, uuid string) error {
	query := `DELETE FROM farms WHERE uuid = $1`
	_, err := p.conn.Exec(ctx, query, uuid)
	return err
}
