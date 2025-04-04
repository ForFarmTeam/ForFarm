package repository

import (
	"context"
	"log/slog"

	"github.com/forfarm/backend/internal/cache"
	"github.com/forfarm/backend/internal/domain"
)

const (
	cacheKeyHarvestUnits = "harvest:units"
)

type postgresHarvestRepository struct {
	conn  Connection
	cache cache.Cache
}

func NewPostgresHarvest(conn Connection, c cache.Cache) domain.HarvestRepository {
	return &postgresHarvestRepository{conn: conn, cache: c}
}

func (p *postgresHarvestRepository) GetUnits(ctx context.Context) ([]domain.HarvestUnit, error) {
	if cached, found := p.cache.Get(cacheKeyHarvestUnits); found {
		if units, ok := cached.([]domain.HarvestUnit); ok {
			slog.DebugContext(ctx, "Cache hit for GetHarvestUnits", "key", cacheKeyHarvestUnits)
			return units, nil
		}
	}
	slog.DebugContext(ctx, "Cache miss for GetHarvestUnits", "key", cacheKeyHarvestUnits)

	query := `SELECT id, name FROM harvest_units ORDER BY id`
	rows, err := p.conn.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var units []domain.HarvestUnit
	for rows.Next() {
		var u domain.HarvestUnit
		if err := rows.Scan(&u.ID, &u.Name); err != nil {
			return nil, err
		}
		units = append(units, u)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(units) > 0 {
		p.cache.Set(cacheKeyHarvestUnits, units, cacheTTLStatic)
	}

	return units, nil
}
