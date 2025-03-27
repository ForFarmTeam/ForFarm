package domain

import (
	"context"
	"time"
)

type FarmAnalytics struct {
	FarmID          string
	Name            string
	OwnerID         string
	LastUpdated     time.Time
	WeatherData     *WeatherAnalytics     `json:"weather_data,omitempty"`
	InventoryData   *InventoryAnalytics   `json:"inventory_data,omitempty"`
	PlantHealthData *PlantHealthAnalytics `json:"plant_health_data,omitempty"`
	FinancialData   *FinancialAnalytics   `json:"financial_data,omitempty"`
	ProductionData  *ProductionAnalytics  `json:"production_data,omitempty"`
}

type WeatherAnalytics struct {
	LastUpdated     time.Time
	Temperature     float64
	Humidity        float64
	Rainfall        float64
	WindSpeed       float64
	WeatherStatus   string
	AlertLevel      string
	ForecastSummary string
}

type InventoryAnalytics struct {
	LastUpdated   time.Time
	TotalItems    int
	LowStockItems int
	TotalValue    float64
	RecentChanges []InventoryChange
}

type InventoryChange struct {
	ItemID       string
	ItemName     string
	ChangeAmount float64
	ChangeType   string
	ChangedAt    time.Time
}

type PlantHealthAnalytics struct {
	LastUpdated        time.Time
	HealthyPlants      int
	UnhealthyPlants    int
	CriticalPlants     int
	RecentHealthIssues []PlantHealthIssue
}

type PlantHealthIssue struct {
	PlantID      string
	PlantName    string
	HealthStatus string
	AlertLevel   string
	RecordedAt   time.Time
}

type FinancialAnalytics struct {
	LastUpdated        time.Time
	TotalRevenue       float64
	TotalExpenses      float64
	NetProfit          float64
	RecentTransactions []TransactionSummary
}

type TransactionSummary struct {
	TransactionID string
	Type          string
	Amount        float64
	Status        string
	CreatedAt     time.Time
}

type ProductionAnalytics struct {
	LastUpdated     time.Time
	TotalProduction float64
	YieldRate       float64
	HarvestForecast float64
}

type AnalyticsRepository interface {
	GetFarmAnalytics(ctx context.Context, farmID string) (*FarmAnalytics, error)
	SaveFarmAnalytics(ctx context.Context, farmID string, data interface{}) error
}
