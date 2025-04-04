package domain

import (
	"context"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Plant struct {
	UUID                 string    `json:"uuid"`
	Name                 string    `json:"name"`
	Variety              *string   `json:"variety,omitempty"`
	RowSpacing           *float64  `json:"rowSpacing,omitempty"`
	OptimalTemp          *float64  `json:"optimalTemp,omitempty"`
	PlantingDepth        *float64  `json:"plantingDepth,omitempty"`
	AverageHeight        *float64  `json:"averageHeight,omitempty"`
	LightProfileID       int       `json:"lightProfileId"`
	SoilConditionID      int       `json:"soilConditionId"`
	PlantingDetail       *string   `json:"plantingDetail,omitempty"`
	IsPerennial          bool      `json:"isPerennial"`
	DaysToEmerge         *int      `json:"daysToEmerge,omitempty"`
	DaysToFlower         *int      `json:"daysToFlower,omitempty"`
	DaysToMaturity       *int      `json:"daysToMaturity,omitempty"`
	HarvestWindow        *int      `json:"harvestWindow,omitempty"`
	PHValue              *float64  `json:"phValue,omitempty"`
	EstimateLossRate     *float64  `json:"estimateLossRate,omitempty"`
	EstimateRevenuePerHU *float64  `json:"estimateRevenuePerHu,omitempty"`
	HarvestUnitID        int       `json:"harvestUnitId"`
	WaterNeeds           *float64  `json:"waterNeeds,omitempty"`
	CreatedAt            time.Time `json:"createdAt"`
	UpdatedAt            time.Time `json:"updatedAt"`
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
	GetByName(context.Context, string) (Plant, error)
	Create(context.Context, *Plant) error
	Update(context.Context, *Plant) error
	Delete(context.Context, string) error
}
