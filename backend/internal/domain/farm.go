package domain

import (
	"context"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Farm struct {
	UUID      string     `json:"uuid"`
	Name      string     `json:"name"`
	Lat       float64    `json:"lat"`
	Lon       float64    `json:"lon"`
	FarmType  string     `json:"farmType,omitempty"`
	TotalSize string     `json:"totalSize,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	OwnerID   string     `json:"ownerId"`
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
