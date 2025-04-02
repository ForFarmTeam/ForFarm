package domain

import (
	"context"
	"time"
)

type FarmAnalytics struct {
	FarmID        string  `json:"farm_id"`
	FarmName      string  `json:"farm_name"`
	OwnerID       string  `json:"owner_id"`
	FarmType      *string `json:"farm_type,omitempty"`
	TotalSize     *string `json:"total_size,omitempty"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	Weather       *WeatherData
	InventoryInfo struct {
		TotalItems    int        `json:"total_items"`
		LowStockCount int        `json:"low_stock_count"`
		LastUpdated   *time.Time `json:"last_updated,omitempty"`
	} `json:"inventory_info"`
	CropInfo struct {
		TotalCount   int        `json:"total_count"`
		GrowingCount int        `json:"growing_count"`
		LastUpdated  *time.Time `json:"last_updated,omitempty"`
	} `json:"crop_info"`
	OverallStatus        *string   `json:"overall_status,omitempty"`
	AnalyticsLastUpdated time.Time `json:"analytics_last_updated"`
}

type CropAnalytics struct {
	CropID        string    `json:"crop_id"`
	CropName      string    `json:"crop_name"`
	FarmID        string    `json:"farm_id"`
	PlantName     string    `json:"plant_name"`
	Variety       *string   `json:"variety,omitempty"`
	CurrentStatus string    `json:"current_status"`
	GrowthStage   string    `json:"growth_stage"`
	LandSize      float64   `json:"land_size"`
	LastUpdated   time.Time `json:"last_updated"`
}

type AnalyticsRepository interface {
	GetFarmAnalytics(ctx context.Context, farmID string) (*FarmAnalytics, error)
	CreateOrUpdateFarmBaseData(ctx context.Context, farm *Farm) error
	UpdateFarmAnalyticsWeather(ctx context.Context, farmID string, weatherData *WeatherData) error
	UpdateFarmAnalyticsCropStats(ctx context.Context, farmID string) error
	UpdateFarmAnalyticsInventoryStats(ctx context.Context, farmID string) error
	DeleteFarmAnalytics(ctx context.Context, farmID string) error
	UpdateFarmOverallStatus(ctx context.Context, farmID string, status string) error
}
