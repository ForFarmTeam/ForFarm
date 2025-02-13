package domain

import (
	"context"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Plant struct {
	UUID                 string
	Name                 string
	Variety              *string
	RowSpacing           *float64
	OptimalTemp          *float64
	PlantingDepth        *float64
	AverageHeight        *float64
	LightProfileID       int
	SoilConditionID      int
	PlantingDetail       *string
	IsPerennial          bool
	DaysToEmerge         *int
	DaysToFlower         *int
	DaysToMaturity       *int
	HarvestWindow        *int
	PHValue              *float64
	EstimateLossRate     *float64
	EstimateRevenuePerHU *float64
	HarvestUnitID        int
	WaterNeeds           *float64
	CreatedAt            time.Time
	UpdatedAt            time.Time
}

func (p *Plant) Validate() error {
	return validation.ValidateStruct(p,
		validation.Field(&p.UUID, validation.Required),
		validation.Field(&p.Name, validation.Required),
		validation.Field(&p.LightProfileID, validation.Required),
		validation.Field(&p.SoilConditionID, validation.Required),
		validation.Field(&p.HarvestUnitID, validation.Required),
	)
}

type PlantRepository interface {
	GetByUUID(context.Context, string) (Plant, error)
	GetAll(context.Context) ([]Plant, error)
	Create(context.Context, *Plant) error
	Update(context.Context, *Plant) error
	Delete(context.Context, string) error
}
