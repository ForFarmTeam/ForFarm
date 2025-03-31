package domain

import (
	"context"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type InventoryStatus string

const (
	StatusInStock    InventoryStatus = "In Stock"
	StatusLowStock   InventoryStatus = "Low Stock"
	StatusOutOfStock InventoryStatus = "Out of Stock"
)

type InventoryItem struct {
	ID        string
	UserID    string
	Name      string
	Category  string
	Type      string
	Quantity  float64
	Unit      string
	DateAdded time.Time
	Status    InventoryStatus
	CreatedAt time.Time
	UpdatedAt time.Time
}

type InventoryFilter struct {
	UserID      string
	Category    string
	Type        string
	Status      InventoryStatus
	StartDate   time.Time
	EndDate     time.Time
	SearchQuery string
}

type InventorySort struct {
	Field     string
	Direction string
}

func (i *InventoryItem) Validate() error {
	return validation.ValidateStruct(i,
		validation.Field(&i.UserID, validation.Required),
		validation.Field(&i.Name, validation.Required),
		validation.Field(&i.Category, validation.Required),
		validation.Field(&i.Type, validation.Required),
		validation.Field(&i.Quantity, validation.Required, validation.Min(0.0)),
		validation.Field(&i.Unit, validation.Required),
		validation.Field(&i.Status, validation.Required, validation.In(StatusInStock, StatusLowStock, StatusOutOfStock)),
	)
}

type InventoryRepository interface {
	GetByID(ctx context.Context, id, userID string) (InventoryItem, error)
	GetByUserID(ctx context.Context, userID string, filter InventoryFilter, sort InventorySort) ([]InventoryItem, error)
	GetAll(ctx context.Context) ([]InventoryItem, error)
	CreateOrUpdate(ctx context.Context, item *InventoryItem) error
	Delete(ctx context.Context, id, userID string) error
}
