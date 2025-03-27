package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/forfarm/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresAnalyticsRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresAnalyticsRepository(pool *pgxpool.Pool) domain.AnalyticsRepository {
	return &PostgresAnalyticsRepository{pool: pool}
}

func (p *PostgresAnalyticsRepository) GetFarmAnalytics(ctx context.Context, farmID string) (*domain.FarmAnalytics, error) {
	query := `
		SELECT
			farm_id,
			farm_name,
			owner_id,
			last_updated,
			weather_data,
			inventory_data,
			plant_health_data,
			financial_data,
			production_data
		FROM
			farm_analytics_view
		WHERE
			farm_id = $1`

	var analytics domain.FarmAnalytics
	var weatherJSON, inventoryJSON, plantHealthJSON, financialJSON, productionJSON []byte

	err := p.pool.QueryRow(ctx, query, farmID).Scan(
		&analytics.FarmID,
		&analytics.Name,
		&analytics.OwnerID,
		&analytics.LastUpdated,
		&weatherJSON,
		&inventoryJSON,
		&plantHealthJSON,
		&financialJSON,
		&productionJSON,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("no analytics found for farm %s", farmID)
		}
		return nil, err
	}

	// Unmarshal JSON data into structs
	if len(weatherJSON) > 0 {
		var weather domain.WeatherAnalytics
		if err := json.Unmarshal(weatherJSON, &weather); err == nil {
			analytics.WeatherData = &weather
		}
	}

	if len(inventoryJSON) > 0 {
		var inventory domain.InventoryAnalytics
		if err := json.Unmarshal(inventoryJSON, &inventory); err == nil {
			analytics.InventoryData = &inventory
		}
	}

	if len(plantHealthJSON) > 0 {
		var plantHealth domain.PlantHealthAnalytics
		if err := json.Unmarshal(plantHealthJSON, &plantHealth); err == nil {
			analytics.PlantHealthData = &plantHealth
		}
	}

	if len(financialJSON) > 0 {
		var financial domain.FinancialAnalytics
		if err := json.Unmarshal(financialJSON, &financial); err == nil {
			analytics.FinancialData = &financial
		}
	}

	if len(productionJSON) > 0 {
		var production domain.ProductionAnalytics
		if err := json.Unmarshal(productionJSON, &production); err == nil {
			analytics.ProductionData = &production
		}
	}

	return &analytics, nil
}

func (p *PostgresAnalyticsRepository) SaveFarmAnalytics(ctx context.Context, farmID string, data interface{}) error {
	var jsonData []byte
	var err error

	// Handle different possible types of the data parameter
	switch v := data.(type) {
	case []byte:
		jsonData = v
	case string:
		jsonData = []byte(v)
	case map[string]interface{}:
		jsonData, err = json.Marshal(v)
	default:
		jsonData, err = json.Marshal(v)
	}

	if err != nil {
		return fmt.Errorf("failed to prepare JSON data: %w", err)
	}

	// Validate that we have valid JSON
	var testObj interface{}
	if err := json.Unmarshal(jsonData, &testObj); err != nil {
		return fmt.Errorf("invalid JSON data: %w", err)
	}

	query := `
		INSERT INTO analytics_events (  
				farm_id,  
				event_type,  
				event_data,  
				created_at  
			) VALUES ($1, $2, $3::jsonb, $4)`

	eventType := "farm.status_changed"

	_, err = p.pool.Exec(ctx, query, farmID, eventType, string(jsonData), time.Now())
	if err != nil {
		return fmt.Errorf("failed to insert analytics event: %w", err)
	}

	return nil
}
