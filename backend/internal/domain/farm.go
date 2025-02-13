package domain

import (
	"context"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Farm struct {
	UUID      string
	Name      string
	Lat       float64
	Lon       float64
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
	GetByID(context.Context, string) (Farm, error)
	CreateOrUpdate(context.Context, *Farm) error
  Delete(context.Context, string) error
}
