package domain

import (
	"context"
	"encoding/json"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Cropland struct {
	UUID        string          `json:"uuid"`
	Name        string          `json:"name"`
	Status      string          `json:"status"`
	Priority    int             `json:"priority"`
	LandSize    float64         `json:"landSize"`
	GrowthStage string          `json:"growthStage"`
	PlantID     string          `json:"plantId"`
	FarmID      string          `json:"farmId"`
	GeoFeature  json.RawMessage `json:"geoFeature,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
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
	GetAll(ctx context.Context) ([]Cropland, error)
	CreateOrUpdate(context.Context, *Cropland) error
	Delete(context.Context, string) error
	SetEventPublisher(EventPublisher)
}
