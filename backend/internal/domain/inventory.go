package domain

import (
	"context"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type InventoryStatus struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type InventoryCategory struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type HarvestUnit struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type InventoryItem struct {
	ID         string            `json:"id"`
	UserID     string            `json:"userId"`
	Name       string            `json:"name"`
	CategoryID int               `json:"categoryId"`
	Category   InventoryCategory `json:"category"`
	Quantity   float64           `json:"quantity"`
	UnitID     int               `json:"unitId"`
	Unit       HarvestUnit       `json:"unit"`
	DateAdded  time.Time         `json:"dateAdded"`
	StatusID   int               `json:"statusId"`
	Status     InventoryStatus   `json:"status"`
	CreatedAt  time.Time         `json:"createdAt"`
	UpdatedAt  time.Time         `json:"updatedAt"`
}

type InventoryFilter struct {
	UserID      string
	CategoryID  int
	StatusID    int
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
		validation.Field(&i.CategoryID, validation.Required),
		validation.Field(&i.Quantity, validation.Required, validation.Min(0.0)),
		validation.Field(&i.UnitID, validation.Required),
		validation.Field(&i.StatusID, validation.Required),
		validation.Field(&i.DateAdded, validation.Required),
	)
}

type InventoryRepository interface {
	GetByID(ctx context.Context, id, userID string) (InventoryItem, error)
	GetByUserID(ctx context.Context, userID string, filter InventoryFilter, sort InventorySort) ([]InventoryItem, error)
	GetAll(ctx context.Context) ([]InventoryItem, error)
	CreateOrUpdate(ctx context.Context, item *InventoryItem) error
	Delete(ctx context.Context, id, userID string) error
	GetStatuses(ctx context.Context) ([]InventoryStatus, error)
	GetCategories(ctx context.Context) ([]InventoryCategory, error)
}

type HarvestRepository interface {
	GetUnits(ctx context.Context) ([]HarvestUnit, error)
}
