// backend/internal/repository/postgres_farm_analytics.go
package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/forfarm/backend/internal/domain"
	"github.com/forfarm/backend/internal/services"
	"github.com/jackc/pgx/v5"
)

type postgresFarmAnalyticsRepository struct {
	conn             Connection
	logger           *slog.Logger
	analyticsService *services.AnalyticsService
}

func NewPostgresFarmAnalyticsRepository(conn Connection, logger *slog.Logger, analyticsService *services.AnalyticsService) domain.AnalyticsRepository {
	if logger == nil {
		logger = slog.Default()
	}
	if analyticsService == nil {
		analyticsService = services.NewAnalyticsService()
	}
	return &postgresFarmAnalyticsRepository{
		conn:             conn,
		logger:           logger,
		analyticsService: analyticsService,
	}
}

func (r *postgresFarmAnalyticsRepository) GetFarmAnalytics(ctx context.Context, farmID string) (*domain.FarmAnalytics, error) {
	query := `
		SELECT
			farm_id, farm_name, owner_id, farm_type, total_size, latitude, longitude,
			weather_temp_celsius, weather_humidity, weather_description, weather_icon,
			weather_wind_speed, weather_rain_1h, weather_observed_at, weather_last_updated,
			inventory_total_items, inventory_low_stock_count, inventory_last_updated,
			crop_total_count, crop_growing_count, crop_last_updated,
			overall_status, analytics_last_updated
		FROM public.farm_analytics
		WHERE farm_id = $1`

	var analytics domain.FarmAnalytics
	var farmType sql.NullString
	var totalSize sql.NullString
	var weatherJSON, inventoryJSON, cropJSON []byte // Use []byte for JSONB
	var overallStatus sql.NullString

	err := r.conn.QueryRow(ctx, query, farmID).Scan(
		&analytics.FarmID,
		&analytics.FarmName,
		&analytics.OwnerID,
		&farmType,
		&totalSize,
		&analytics.Latitude, // Scan directly into the struct fields
		&analytics.Longitude,
		&weatherJSON,
		&inventoryJSON,
		&cropJSON,
		&overallStatus,
		&analytics.AnalyticsLastUpdated,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) || errors.Is(err, pgx.ErrNoRows) {
			r.logger.Warn("Farm analytics data not found", "farm_id", farmID)
			return nil, domain.ErrNotFound
		}
		r.logger.Error("Failed to query farm analytics", "farm_id", farmID, "error", err)
		return nil, fmt.Errorf("database query failed for farm analytics: %w", err)
	}

	// Handle nullable fields
	if farmType.Valid {
		analytics.FarmType = &farmType.String
	}
	if totalSize.Valid {
		analytics.TotalSize = &totalSize.String
	}
	if overallStatus.Valid {
		analytics.OverallStatus = &overallStatus.String
	}

	// Unmarshal JSONB data
	if weatherJSON != nil {
		if err := json.Unmarshal(weatherJSON, &analytics.Weather); err != nil {
			r.logger.Warn("Failed to unmarshal weather data from farm analytics", "farm_id", farmID, "error", err)
			// Continue, but log the issue
		}
	}
	if inventoryJSON != nil {
		if err := json.Unmarshal(inventoryJSON, &analytics.InventoryInfo); err != nil {
			r.logger.Warn("Failed to unmarshal inventory data from farm analytics", "farm_id", farmID, "error", err)
		}
	}
	if cropJSON != nil {
		if err := json.Unmarshal(cropJSON, &analytics.CropInfo); err != nil {
			r.logger.Warn("Failed to unmarshal crop data from farm analytics", "farm_id", farmID, "error", err)
		}
	}

	r.logger.Debug("Successfully retrieved farm analytics", "farm_id", farmID)
	return &analytics, nil
}

// --- Calculation Helper ---

// calculateGrowthProgress calculates the percentage completion based on planting date and maturity days.
func calculateGrowthProgress(plantedAt time.Time, daysToMaturity *int) int {
	if daysToMaturity == nil || *daysToMaturity <= 0 {
		return 0 // Cannot calculate if maturity days are unknown or zero
	}
	if plantedAt.IsZero() {
		return 0 // Cannot calculate if planting date is unknown
	}

	today := time.Now()
	daysElapsed := today.Sub(plantedAt).Hours() / 24
	progress := (daysElapsed / float64(*daysToMaturity)) * 100

	// Clamp progress between 0 and 100
	if progress < 0 {
		return 0
	}
	if progress > 100 {
		return 100
	}
	return int(progress)
}

// --- GetCropAnalytics ---

func (r *postgresFarmAnalyticsRepository) GetCropAnalytics(ctx context.Context, cropID string) (*domain.CropAnalytics, error) {
	// Fetch base data from croplands and plants
	query := `
		SELECT
			c.uuid, c.name, c.farm_id, c.status, c.growth_stage, c.land_size, c.updated_at,
			p.name, p.variety, p.days_to_maturity,
			c.created_at -- Planted date proxy
		FROM
			croplands c
		JOIN
			plants p ON c.plant_id = p.uuid
		WHERE
			c.uuid = $1
	`

	var analytics domain.CropAnalytics // Initialize the struct to be populated
	var plantName string
	var variety sql.NullString
	var daysToMaturity sql.NullInt32
	var plantedAt time.Time
	var croplandLastUpdated time.Time // Capture cropland specific update time

	err := r.conn.QueryRow(ctx, query, cropID).Scan(
		&analytics.CropID,
		&analytics.CropName,
		&analytics.FarmID,
		&analytics.CurrentStatus,
		&analytics.GrowthStage,
		&analytics.LandSize,
		&croplandLastUpdated, // Use this for action suggestion timing
		&plantName,
		&variety,
		&daysToMaturity,
		&plantedAt,
	)

	if err != nil {
		// ... (error handling as before) ...
		if errors.Is(err, sql.ErrNoRows) || errors.Is(err, pgx.ErrNoRows) {
			r.logger.Warn("Crop analytics base data query returned no rows", "crop_id", cropID)
			return nil, domain.ErrNotFound
		}
		r.logger.Error("Failed to query crop base data", "crop_id", cropID, "error", err)
		return nil, fmt.Errorf("database query failed for crop base data: %w", err)
	}

	// --- Populate direct fields ---
	analytics.PlantName = plantName
	if variety.Valid {
		analytics.Variety = &variety.String
	}
	analytics.LastUpdated = time.Now().UTC() // Set analytics generation time

	// --- Calculate/Fetch derived fields using the service ---

	// Growth Progress
	var maturityDaysPtr *int
	if daysToMaturity.Valid {
		maturityInt := int(daysToMaturity.Int32)
		maturityDaysPtr = &maturityInt
	}
	analytics.GrowthProgress = calculateGrowthProgress(plantedAt, maturityDaysPtr)

	// Environmental Data (includes placeholders)
	farmAnalytics, farmErr := r.GetFarmAnalytics(ctx, analytics.FarmID)
	if farmErr != nil && !errors.Is(farmErr, domain.ErrNotFound) {
		r.logger.Warn("Could not fetch associated farm analytics for crop context", "farm_id", analytics.FarmID, "crop_id", cropID, "error", farmErr)
		// Proceed without farm-level weather data if farm analytics fetch fails
	}
	analytics.Temperature, analytics.Humidity, analytics.WindSpeed, analytics.Rainfall, analytics.Sunlight, analytics.SoilMoisture = r.analyticsService.GetEnvironmentalData(farmAnalytics)

	// Plant Health (Dummy)
	health := r.analyticsService.CalculatePlantHealth(analytics.CurrentStatus, analytics.GrowthStage)
	analytics.PlantHealth = &health

	// Next Action (Dummy)
	analytics.NextAction, analytics.NextActionDue = r.analyticsService.SuggestNextAction(analytics.GrowthStage, croplandLastUpdated) // Use cropland update time

	// Nutrient Levels (Dummy)
	analytics.NutrientLevels = r.analyticsService.GetNutrientLevels(analytics.CropID)

	// --- End Service Usage ---

	r.logger.Debug("Successfully constructed crop analytics", "crop_id", cropID)
	return &analytics, nil
}

// --- Implement other AnalyticsRepository methods ---

func (r *postgresFarmAnalyticsRepository) CreateOrUpdateFarmBaseData(ctx context.Context, farm *domain.Farm) error {
	query := `
        INSERT INTO farm_analytics (farm_id, farm_name, owner_id, farm_type, total_size, lat, lon, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (farm_id) DO UPDATE
        SET farm_name = EXCLUDED.farm_name,
            owner_id = EXCLUDED.owner_id,
            farm_type = EXCLUDED.farm_type,
            total_size = EXCLUDED.total_size,
            lat = EXCLUDED.lat,
            lon = EXCLUDED.lon,
            last_updated = EXCLUDED.last_updated;`

	_, err := r.conn.Exec(ctx, query,
		farm.UUID,
		farm.Name,
		farm.OwnerID,
		farm.FarmType,  // Handle potential empty string vs null if needed
		farm.TotalSize, // Handle potential empty string vs null if needed
		farm.Lat,
		farm.Lon,
		time.Now().UTC(), // Update timestamp on change
	)
	if err != nil {
		r.logger.Error("Failed to create/update farm base analytics data", "farm_id", farm.UUID, "error", err)
		return fmt.Errorf("failed to upsert farm base data: %w", err)
	}
	r.logger.Debug("Upserted farm base analytics data", "farm_id", farm.UUID)
	return nil
}

func (r *postgresFarmAnalyticsRepository) UpdateFarmAnalyticsWeather(ctx context.Context, farmID string, weatherData *domain.WeatherData) error {
	if weatherData == nil {
		return fmt.Errorf("weather data cannot be nil")
	}

	weatherJSON, err := json.Marshal(weatherData)
	if err != nil {
		r.logger.Error("Failed to marshal weather data for analytics update", "farm_id", farmID, "error", err)
		return fmt.Errorf("failed to marshal weather data: %w", err)
	}

	query := `
        UPDATE farm_analytics
        SET weather_data = $1,
            last_updated = $2
        WHERE farm_id = $3;`

	cmdTag, err := r.conn.Exec(ctx, query, weatherJSON, time.Now().UTC(), farmID)
	if err != nil {
		r.logger.Error("Failed to update farm analytics weather data", "farm_id", farmID, "error", err)
		return fmt.Errorf("database update failed for weather data: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		r.logger.Warn("No farm analytics record found to update weather data", "farm_id", farmID)
		// Optionally, create the base record here if it should always exist
		return domain.ErrNotFound // Or handle as appropriate
	}

	r.logger.Debug("Updated farm analytics weather data", "farm_id", farmID)
	return nil
}

// UpdateFarmAnalyticsCropStats needs to query the croplands table for the farm
func (r *postgresFarmAnalyticsRepository) UpdateFarmAnalyticsCropStats(ctx context.Context, farmID string) error {
	var totalCount, growingCount int

	// Query to count total and growing crops for the farm
	query := `
        SELECT
            COUNT(*),
            COUNT(*) FILTER (WHERE status = 'growing') -- Case-insensitive comparison if needed: LOWER(status) = 'growing'
        FROM croplands
        WHERE farm_id = $1;`

	err := r.conn.QueryRow(ctx, query, farmID).Scan(&totalCount, &growingCount)
	if err != nil {
		// Log error but don't fail the projection if stats can't be calculated temporarily
		r.logger.Error("Failed to calculate crop stats for analytics", "farm_id", farmID, "error", err)
		return fmt.Errorf("failed to calculate crop stats: %w", err)
	}

	// Construct the JSONB object for crop_data
	cropInfo := map[string]interface{}{
		"totalCount":   totalCount,
		"growingCount": growingCount,
		"lastUpdated":  time.Now().UTC(), // Timestamp of this calculation
	}
	cropJSON, err := json.Marshal(cropInfo)
	if err != nil {
		r.logger.Error("Failed to marshal crop stats data", "farm_id", farmID, "error", err)
		return fmt.Errorf("failed to marshal crop stats: %w", err)
	}

	// Update the farm_analytics table
	updateQuery := `
        UPDATE farm_analytics
        SET crop_data = $1,
            last_updated = $2 -- Also update the main last_updated timestamp
        WHERE farm_id = $3;`

	cmdTag, err := r.conn.Exec(ctx, updateQuery, cropJSON, time.Now().UTC(), farmID)
	if err != nil {
		r.logger.Error("Failed to update farm analytics crop stats", "farm_id", farmID, "error", err)
		return fmt.Errorf("database update failed for crop stats: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		r.logger.Warn("No farm analytics record found to update crop stats", "farm_id", farmID)
		// Optionally, create the base record here
	} else {
		r.logger.Debug("Updated farm analytics crop stats", "farm_id", farmID, "total", totalCount, "growing", growingCount)
	}
	return nil
}

// UpdateFarmAnalyticsInventoryStats needs to query inventory_items
func (r *postgresFarmAnalyticsRepository) UpdateFarmAnalyticsInventoryStats(ctx context.Context, farmID string) error {
	var totalItems, lowStockCount int
	var lastUpdated sql.NullTime

	// Query to get inventory stats for the user owning the farm
	// NOTE: This assumes inventory is linked by user_id, and we need the user_id for the farm owner.
	// Step 1: Get Owner ID from farm_analytics table
	var ownerID string
	ownerQuery := `SELECT owner_id FROM farm_analytics WHERE farm_id = $1`
	err := r.conn.QueryRow(ctx, ownerQuery, farmID).Scan(&ownerID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) || errors.Is(err, pgx.ErrNoRows) {
			r.logger.Warn("Cannot update inventory stats, farm analytics record not found", "farm_id", farmID)
			return nil // Or return ErrNotFound if critical
		}
		r.logger.Error("Failed to get owner ID for inventory stats update", "farm_id", farmID, "error", err)
		return fmt.Errorf("failed to get owner ID: %w", err)
	}

	// Step 2: Query inventory based on owner ID
	query := `
        SELECT
            COUNT(*),
            COUNT(*) FILTER (WHERE status_id = (SELECT id FROM inventory_status WHERE name = 'Low Stock')), -- Assumes 'Low Stock' status name
            MAX(updated_at) -- Get the latest update timestamp from inventory items
        FROM inventory_items
        WHERE user_id = $1;`

	err = r.conn.QueryRow(ctx, query, ownerID).Scan(&totalItems, &lowStockCount, &lastUpdated)
	if err != nil {
		// Log error but don't fail the projection if stats can't be calculated temporarily
		r.logger.Error("Failed to calculate inventory stats for analytics", "farm_id", farmID, "owner_id", ownerID, "error", err)
		return fmt.Errorf("failed to calculate inventory stats: %w", err)
	}

	// Construct the JSONB object for inventory_data
	inventoryInfo := map[string]interface{}{
		"totalItems":    totalItems,
		"lowStockCount": lowStockCount,
		"lastUpdated":   nil, // Initialize as nil
	}
	// Only set lastUpdated if the MAX(updated_at) query returned a valid time
	if lastUpdated.Valid {
		inventoryInfo["lastUpdated"] = lastUpdated.Time.UTC()
	}

	inventoryJSON, err := json.Marshal(inventoryInfo)
	if err != nil {
		r.logger.Error("Failed to marshal inventory stats data", "farm_id", farmID, "error", err)
		return fmt.Errorf("failed to marshal inventory stats: %w", err)
	}

	// Update the farm_analytics table
	updateQuery := `
        UPDATE farm_analytics
        SET inventory_data = $1,
            last_updated = $2 -- Also update the main last_updated timestamp
        WHERE farm_id = $3;`

	cmdTag, err := r.conn.Exec(ctx, updateQuery, inventoryJSON, time.Now().UTC(), farmID)
	if err != nil {
		r.logger.Error("Failed to update farm analytics inventory stats", "farm_id", farmID, "error", err)
		return fmt.Errorf("database update failed for inventory stats: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		r.logger.Warn("No farm analytics record found to update inventory stats", "farm_id", farmID)
	} else {
		r.logger.Debug("Updated farm analytics inventory stats", "farm_id", farmID, "total", totalItems, "lowStock", lowStockCount)
	}
	return nil
}

func (r *postgresFarmAnalyticsRepository) DeleteFarmAnalytics(ctx context.Context, farmID string) error {
	query := `DELETE FROM farm_analytics WHERE farm_id = $1;`
	cmdTag, err := r.conn.Exec(ctx, query, farmID)
	if err != nil {
		r.logger.Error("Failed to delete farm analytics data", "farm_id", farmID, "error", err)
		return fmt.Errorf("database delete failed for farm analytics: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		r.logger.Warn("No farm analytics record found to delete", "farm_id", farmID)
		// Return ErrNotFound if it's important to know it wasn't there
		return domain.ErrNotFound
	}
	r.logger.Info("Deleted farm analytics data", "farm_id", farmID)
	return nil
}

func (r *postgresFarmAnalyticsRepository) UpdateFarmOverallStatus(ctx context.Context, farmID string, status string) error {
	query := `
        UPDATE farm_analytics
        SET overall_status = $1,
            last_updated = $2
        WHERE farm_id = $3;`

	cmdTag, err := r.conn.Exec(ctx, query, status, time.Now().UTC(), farmID)
	if err != nil {
		r.logger.Error("Failed to update farm overall status", "farm_id", farmID, "status", status, "error", err)
		return fmt.Errorf("database update failed for overall status: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		r.logger.Warn("No farm analytics record found to update overall status", "farm_id", farmID)
		// Optionally, create the base record here if needed
		return domain.ErrNotFound
	}
	r.logger.Debug("Updated farm overall status", "farm_id", farmID, "status", status)
	return nil
}
