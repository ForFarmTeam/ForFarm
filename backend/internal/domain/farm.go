package domain

import (
	"context"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Farm struct {
	UUID      string
	Name      string
	Lat       float64 // single latitude value
	Lon       float64 // single longitude value
	FarmType  string  // e.g., "Durian", "mango", "mixed-crop", "others"
	TotalSize string  // e.g., "10 Rai" (optional)
	CreatedAt time.Time
	UpdatedAt time.Time
	OwnerID   string
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
}
