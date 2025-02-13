package domain

import (
	"context"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Cropland struct {
	UUID        string
	Name        string
	Status      string
	Priority    int
	LandSize    float64
	GrowthStage string
	PlantID     string
	FarmID      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (c *Cropland) Validate() error {
	return validation.ValidateStruct(c,
		validation.Field(&c.Name, validation.Required),
		validation.Field(&c.Status, validation.Required),
		validation.Field(&c.GrowthStage, validation.Required),
		validation.Field(&c.LandSize, validation.Required),
	)
}

type CroplandRepository interface {
	GetByID(context.Context, string) (Cropland, error)
	GetByFarmID(ctx context.Context, farmID string) ([]Cropland, error)
	GetAll(ctx context.Context) ([]Cropland, error) // Add this method
	CreateOrUpdate(context.Context, *Cropland) error
	Delete(context.Context, string) error
}
