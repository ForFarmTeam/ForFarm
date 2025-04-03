package domain

import (
	"context"
	"time"
)

type FarmAnalytics struct {
	FarmID        string  `json:"farmId"`
	FarmName      string  `json:"farmName"`
	OwnerID       string  `json:"ownerId"`
	FarmType      *string `json:"farmType,omitempty"`
	TotalSize     *string `json:"totalSize,omitempty"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	Weather       *WeatherData
	InventoryInfo struct {
		TotalItems    int        `json:"totalItems"`
		LowStockCount int        `json:"lowStockCount"`
		LastUpdated   *time.Time `json:"lastUpdated,omitempty"`
	} `json:"inventoryInfo"`
	CropInfo struct {
		TotalCount   int        `json:"totalCount"`
		GrowingCount int        `json:"growingCount"`
		LastUpdated  *time.Time `json:"lastUpdated,omitempty"`
	} `json:"cropInfo"`
	OverallStatus        *string   `json:"overallStatus,omitempty"`
	AnalyticsLastUpdated time.Time `json:"analyticsLastUpdated"`
}

type CropAnalytics struct {
	CropID         string     `json:"cropId"`
	CropName       string     `json:"cropName"`
	FarmID         string     `json:"farmId"`
	PlantName      string     `json:"plantName"`
	Variety        *string    `json:"variety,omitempty"`
	CurrentStatus  string     `json:"currentStatus"`
	GrowthStage    string     `json:"growthStage"`
	LandSize       float64    `json:"landSize"`
	LastUpdated    time.Time  `json:"lastUpdated"`
	Temperature    *float64   `json:"temperature,omitempty"`
	Humidity       *float64   `json:"humidity,omitempty"`
	SoilMoisture   *float64   `json:"soilMoisture,omitempty"`
	Sunlight       *float64   `json:"sunlight,omitempty"`
	WindSpeed      *string    `json:"windSpeed,omitempty"`
	Rainfall       *string    `json:"rainfall,omitempty"`
	GrowthProgress int        `json:"growthProgress"`
	NextAction     *string    `json:"nextAction,omitempty"`
	NextActionDue  *time.Time `json:"nextActionDue,omitempty"`
	NutrientLevels *struct {
		Nitrogen   *float64 `json:"nitrogen,omitempty"`
		Phosphorus *float64 `json:"phosphorus,omitempty"`
		Potassium  *float64 `json:"potassium,omitempty"`
	} `json:"nutrientLevels,omitempty"`
	PlantHealth *string `json:"plantHealth,omitempty"`
}

type AnalyticsRepository interface {
	GetFarmAnalytics(ctx context.Context, farmID string) (*FarmAnalytics, error)
	GetCropAnalytics(ctx context.Context, cropID string) (*CropAnalytics, error)
	CreateOrUpdateFarmBaseData(ctx context.Context, farm *Farm) error
	UpdateFarmAnalyticsWeather(ctx context.Context, farmID string, weatherData *WeatherData) error
	UpdateFarmAnalyticsCropStats(ctx context.Context, farmID string) error
	UpdateFarmAnalyticsInventoryStats(ctx context.Context, farmID string) error
	DeleteFarmAnalytics(ctx context.Context, farmID string) error
	UpdateFarmOverallStatus(ctx context.Context, farmID string, status string) error
}
