package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/forfarm/backend/internal/domain"
	"github.com/google/uuid"
)

type postgresInventoryRepository struct {
	conn           Connection
	eventPublisher domain.EventPublisher
}

func NewPostgresInventory(conn Connection, publisher domain.EventPublisher) domain.InventoryRepository {
	return &postgresInventoryRepository{conn: conn, eventPublisher: publisher}
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
			&i.CategoryID,
			&i.Quantity,
			&i.UnitID,
			&i.DateAdded,
			&i.StatusID,
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
		SELECT 
			i.id, i.user_id, i.name, i.category_id, i.quantity, i.unit_id, 
			i.date_added, i.status_id, i.created_at, i.updated_at,
			c.name as category_name,
			s.name as status_name,
			u.name as unit_name
		FROM inventory_items i
		LEFT JOIN inventory_category c ON i.category_id = c.id
		LEFT JOIN inventory_status s ON i.status_id = s.id
		LEFT JOIN harvest_units u ON i.unit_id = u.id
		WHERE i.id = $1 AND i.user_id = $2`

	rows, err := p.conn.Query(ctx, query, id, userID)
	if err != nil {
		return domain.InventoryItem{}, err
	}
	defer rows.Close()

	if !rows.Next() {
		return domain.InventoryItem{}, domain.ErrNotFound
	}

	var item domain.InventoryItem
	err = rows.Scan(
		&item.ID,
		&item.UserID,
		&item.Name,
		&item.CategoryID,
		&item.Quantity,
		&item.UnitID,
		&item.DateAdded,
		&item.StatusID,
		&item.CreatedAt,
		&item.UpdatedAt,
		&item.Category.Name,
		&item.Status.Name,
		&item.Unit.Name,
	)
	if err != nil {
		return domain.InventoryItem{}, err
	}

	return item, nil
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
		SELECT 
			i.id, i.user_id, i.name, i.category_id, i.quantity, i.unit_id, 
			i.date_added, i.status_id, i.created_at, i.updated_at,
			c.name as category_name,
			s.name as status_name,
			u.name as unit_name
		FROM inventory_items i
		LEFT JOIN inventory_category c ON i.category_id = c.id
		LEFT JOIN inventory_status s ON i.status_id = s.id
		LEFT JOIN harvest_units u ON i.unit_id = u.id
		WHERE i.user_id = $1`)

	if filter.CategoryID != 0 {
		query.WriteString(fmt.Sprintf(" AND i.category_id = $%d", argPos))
		args = append(args, filter.CategoryID)
		argPos++
	}

	if filter.StatusID != 0 {
		query.WriteString(fmt.Sprintf(" AND i.status_id = $%d", argPos))
		args = append(args, filter.StatusID)
		argPos++
	}

	if !filter.StartDate.IsZero() {
		query.WriteString(fmt.Sprintf(" AND i.date_added >= $%d", argPos))
		args = append(args, filter.StartDate)
		argPos++
	}

	if !filter.EndDate.IsZero() {
		query.WriteString(fmt.Sprintf(" AND i.date_added <= $%d", argPos))
		args = append(args, filter.EndDate)
		argPos++
	}

	if filter.SearchQuery != "" {
		query.WriteString(fmt.Sprintf(" AND i.name ILIKE $%d", argPos))
		args = append(args, "%"+filter.SearchQuery+"%")
		argPos++
	}

	if sort.Field == "" {
		sort.Field = "i.date_added"
		sort.Direction = "desc"
	}

	validSortFields := map[string]bool{
		"name":       true,
		"quantity":   true,
		"date_added": true,
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

	rows, err := p.conn.Query(ctx, query.String(), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.InventoryItem
	for rows.Next() {
		var item domain.InventoryItem
		err := rows.Scan(
			&item.ID,
			&item.UserID,
			&item.Name,
			&item.CategoryID,
			&item.Quantity,
			&item.UnitID,
			&item.DateAdded,
			&item.StatusID,
			&item.CreatedAt,
			&item.UpdatedAt,
			&item.Category.Name,
			&item.Status.Name,
			&item.Unit.Name,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

func (p *postgresInventoryRepository) GetAll(ctx context.Context) ([]domain.InventoryItem, error) {
	query := `
		SELECT 
			i.id, i.user_id, i.name, i.category_id, i.quantity, i.unit_id, 
			i.date_added, i.status_id, i.created_at, i.updated_at,
			c.name as category_name,
			s.name as status_name,
			u.name as unit_name
		FROM inventory_items i
		LEFT JOIN inventory_category c ON i.category_id = c.id
		LEFT JOIN inventory_status s ON i.status_id = s.id
		LEFT JOIN harvest_units u ON i.unit_id = u.id
		ORDER BY i.created_at DESC`
	return p.fetch(ctx, query)
}

func (p *postgresInventoryRepository) CreateOrUpdate(ctx context.Context, item *domain.InventoryItem) error {
	now := time.Now()
	item.UpdatedAt = now
	isNew := false

	if item.ID == "" {
		isNew = true
		item.CreatedAt = now
		query := `
			INSERT INTO inventory_items
			(id, user_id, name, category_id, quantity, unit_id, date_added, status_id, created_at, updated_at)
			VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING id`
		err := p.conn.QueryRow(
			ctx,
			query,
			item.UserID, item.Name, item.CategoryID, item.Quantity,
			item.UnitID, item.DateAdded, item.StatusID, item.CreatedAt, item.UpdatedAt,
		).Scan(&item.ID)
		if err != nil {
			// Log error
			return err
		}
	} else {
		query := `
			UPDATE inventory_items
			SET name = $1, category_id = $2, quantity = $3, unit_id = $4,
			    date_added = $5, status_id = $6, updated_at = $7
			WHERE id = $8 AND user_id = $9
			RETURNING id` // Ensure RETURNING id exists or handle differently
		err := p.conn.QueryRow(
			ctx,
			query,
			item.Name, item.CategoryID, item.Quantity, item.UnitID,
			item.DateAdded, item.StatusID, item.UpdatedAt, item.ID, item.UserID,
		).Scan(&item.ID) // Scan to confirm update happened or handle potential ErrNoRows
		if err != nil {
			// Log error
			return err
		}
	}

	// --- Publish Event ---
	if p.eventPublisher != nil {
		eventType := "inventory.item.updated"
		if isNew {
			eventType = "inventory.item.created"
		}

		payload := map[string]interface{}{
			"item_id":     item.ID,
			"user_id":     item.UserID, // Include user ID for potential farm lookup in projection
			"name":        item.Name,
			"category_id": item.CategoryID,
			"quantity":    item.Quantity,
			"unit_id":     item.UnitID,
			"status_id":   item.StatusID,
			"date_added":  item.DateAdded,
			"updated_at":  item.UpdatedAt,
			// NO farm_id easily available here without extra lookup
		}

		event := domain.Event{
			ID:          uuid.NewString(),
			Type:        eventType,
			Source:      "inventory-repository",
			Timestamp:   time.Now().UTC(),
			AggregateID: item.UserID, // Use UserID as AggregateID for inventory? Or item.ID? Let's use item.ID.
			Payload:     payload,
		}
		// Use AggregateID = item.ID for consistency if item is the aggregate root
		event.AggregateID = item.ID

		go func() {
			bgCtx := context.Background()
			if errPub := p.eventPublisher.Publish(bgCtx, event); errPub != nil {
				fmt.Printf("Error publishing %s event: %v\n", eventType, errPub) // Use proper logging
			}
		}()
	}
	// --- End Publish Event ---

	return nil
}

func (p *postgresInventoryRepository) Delete(ctx context.Context, id, userID string) error {
	query := `DELETE FROM inventory_items WHERE id = $1 AND user_id = $2`
	cmdTag, err := p.conn.Exec(ctx, query, id, userID)
	if err != nil {
		// Log error
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return domain.ErrNotFound // Or a permission error if user doesn't match
	}

	// --- Publish Event ---
	if p.eventPublisher != nil {
		eventType := "inventory.item.deleted"
		payload := map[string]interface{}{
			"item_id": id,
			"user_id": userID, // Include user ID
		}
		event := domain.Event{
			ID:          uuid.NewString(),
			Type:        eventType,
			Source:      "inventory-repository",
			Timestamp:   time.Now().UTC(),
			AggregateID: id, // Use item ID as aggregate ID
			Payload:     payload,
		}
		go func() {
			bgCtx := context.Background()
			if errPub := p.eventPublisher.Publish(bgCtx, event); errPub != nil {
				fmt.Printf("Error publishing %s event: %v\n", eventType, errPub) // Use proper logging
			}
		}()
	}
	// --- End Publish Event ---

	return nil
}

func (p *postgresInventoryRepository) GetStatuses(ctx context.Context) ([]domain.InventoryStatus, error) {
	query := `SELECT id, name FROM inventory_status ORDER BY id`
	rows, err := p.conn.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var statuses []domain.InventoryStatus
	for rows.Next() {
		var s domain.InventoryStatus
		if err := rows.Scan(&s.ID, &s.Name); err != nil {
			return nil, err
		}
		statuses = append(statuses, s)
	}
	return statuses, nil
}

func (p *postgresInventoryRepository) GetCategories(ctx context.Context) ([]domain.InventoryCategory, error) {
	query := `SELECT id, name FROM inventory_category ORDER BY id`
	rows, err := p.conn.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []domain.InventoryCategory
	for rows.Next() {
		var c domain.InventoryCategory
		if err := rows.Scan(&c.ID, &c.Name); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}
