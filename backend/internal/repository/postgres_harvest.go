package repository

import (
	"context"

	"github.com/forfarm/backend/internal/domain"
)

type postgresHarvestRepository struct {
	conn Connection
}

func NewPostgresHarvest(conn Connection) domain.HarvestRepository {
	return &postgresHarvestRepository{conn: conn}
}

func (p *postgresHarvestRepository) GetUnits(ctx context.Context) ([]domain.HarvestUnit, error) {
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
	return units, nil
}
