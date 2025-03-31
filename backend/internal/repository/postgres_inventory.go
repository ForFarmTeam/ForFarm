package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/forfarm/backend/internal/domain"
)

type postgresInventoryRepository struct {
	conn Connection
}

func NewPostgresInventory(conn Connection) domain.InventoryRepository {
	return &postgresInventoryRepository{conn: conn}
}

func (p *postgresInventoryRepository) fetch(ctx context.Context, query string, args ...interface{}) ([]domain.InventoryItem, error) {
	rows, err := p.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.InventoryItem
	for rows.Next() {
		var i domain.InventoryItem
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.Name,
			&i.Category,
			&i.Type,
			&i.Quantity,
			&i.Unit,
			&i.DateAdded,
			&i.Status,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

func (p *postgresInventoryRepository) GetByID(ctx context.Context, id, userID string) (domain.InventoryItem, error) {
	query := `
		SELECT id, user_id, name, category, type, quantity, unit, date_added, status, created_at, updated_at
		FROM inventory_items
		WHERE id = $1 AND user_id = $2`

	items, err := p.fetch(ctx, query, id, userID)
	if err != nil {
		return domain.InventoryItem{}, err
	}
	if len(items) == 0 {
		return domain.InventoryItem{}, domain.ErrNotFound
	}
	return items[0], nil
}

func (p *postgresInventoryRepository) GetByUserID(
	ctx context.Context,
	userID string,
	filter domain.InventoryFilter,
	sort domain.InventorySort,
) ([]domain.InventoryItem, error) {
	var query strings.Builder
	args := []interface{}{userID}
	argPos := 2

	query.WriteString(`
		SELECT id, user_id, name, category, type, quantity, unit, date_added, status, created_at, updated_at
		FROM inventory_items
		WHERE user_id = $1`)

	if filter.Category != "" {
		query.WriteString(fmt.Sprintf(" AND category = $%d", argPos))
		args = append(args, filter.Category)
		argPos++
	}

	if filter.Type != "" {
		query.WriteString(fmt.Sprintf(" AND type = $%d", argPos))
		args = append(args, filter.Type)
		argPos++
	}

	if filter.Status != "" {
		query.WriteString(fmt.Sprintf(" AND status = $%d", argPos))
		args = append(args, filter.Status)
		argPos++
	}

	if !filter.StartDate.IsZero() {
		query.WriteString(fmt.Sprintf(" AND date_added >= $%d", argPos))
		args = append(args, filter.StartDate)
		argPos++
	}

	if !filter.EndDate.IsZero() {
		query.WriteString(fmt.Sprintf(" AND date_added <= $%d", argPos))
		args = append(args, filter.EndDate)
		argPos++
	}

	if filter.SearchQuery != "" {
		query.WriteString(fmt.Sprintf(" AND name ILIKE $%d", argPos))
		args = append(args, "%"+filter.SearchQuery+"%")
		argPos++
	}

	if sort.Field == "" {
		sort.Field = "date_added"
		sort.Direction = "desc"
	}

	validSortFields := map[string]bool{
		"name":       true,
		"category":   true,
		"type":       true,
		"quantity":   true,
		"date_added": true,
		"status":     true,
		"created_at": true,
	}

	if validSortFields[sort.Field] {
		query.WriteString(fmt.Sprintf(" ORDER BY %s", sort.Field))
		if strings.ToLower(sort.Direction) == "desc" {
			query.WriteString(" DESC")
		} else {
			query.WriteString(" ASC")
		}
	}

	return p.fetch(ctx, query.String(), args...)
}

func (p *postgresInventoryRepository) GetAll(ctx context.Context) ([]domain.InventoryItem, error) {
	query := `
		SELECT id, user_id, name, category, type, quantity, unit, date_added, status, created_at, updated_at
		FROM inventory_items
		ORDER BY created_at DESC`
	return p.fetch(ctx, query)
}

func (p *postgresInventoryRepository) CreateOrUpdate(ctx context.Context, item *domain.InventoryItem) error {
	now := time.Now()
	item.UpdatedAt = now

	if item.ID == "" {
		item.CreatedAt = now
		query := `  
			INSERT INTO inventory_items 
			(id, user_id, name, category, type, quantity, unit, date_added, status, created_at, updated_at)  
			VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			RETURNING id`
		return p.conn.QueryRow(
			ctx,
			query,
			item.UserID,
			item.Name,
			item.Category,
			item.Type,
			item.Quantity,
			item.Unit,
			item.DateAdded,
			item.Status,
			item.CreatedAt,
			item.UpdatedAt,
		).Scan(&item.ID)
	}

	query := `  
		UPDATE inventory_items 
		SET name = $1,
			category = $2,
			type = $3,
			quantity = $4,
			unit = $5,
			date_added = $6,
			status = $7,
			updated_at = $8
		WHERE id = $9 AND user_id = $10
		RETURNING id`

	return p.conn.QueryRow(
		ctx,
		query,
		item.Name,
		item.Category,
		item.Type,
		item.Quantity,
		item.Unit,
		item.DateAdded,
		item.Status,
		item.UpdatedAt,
		item.ID,
		item.UserID,
	).Scan(&item.ID)
}

func (p *postgresInventoryRepository) Delete(ctx context.Context, id, userID string) error {
	query := `DELETE FROM inventory_items WHERE id = $1 AND user_id = $2`
	_, err := p.conn.Exec(ctx, query, id, userID)
	return err
}
