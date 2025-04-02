package domain

import (
	"context"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Farm struct {
	UUID      string     `json:"uuid"`
	Name      string     `json:"name"`
	Lat       float64    `json:"latitude"`
	Lon       float64    `json:"longitude"`
	FarmType  string     `json:"farm_type,omitempty"`
	TotalSize string     `json:"total_size,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	OwnerID   string     `json:"owner_id"`
	Crops     []Cropland `json:"crops,omitempty"`
}

func (f *Farm) Validate() error {
	return validation.ValidateStruct(f,
		validation.Field(&f.Name, validation.Required),
		validation.Field(&f.Lat, validation.Required),
		validation.Field(&f.Lon, validation.Required),
		validation.Field(&f.OwnerID, validation.Required),
	)
}

type FarmRepository interface {
	GetByID(context.Context, string) (*Farm, error)
	GetByOwnerID(context.Context, string) ([]Farm, error)
	CreateOrUpdate(context.Context, *Farm) error
	Delete(context.Context, string) error
	SetEventPublisher(EventPublisher)
}
