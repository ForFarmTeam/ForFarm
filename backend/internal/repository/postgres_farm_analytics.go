// backend/internal/repository/postgres_farm_analytics.go
package repository

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/forfarm/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresFarmAnalyticsRepository struct {
	pool   *pgxpool.Pool
	logger *slog.Logger
}

func NewPostgresFarmAnalyticsRepository(pool *pgxpool.Pool, logger *slog.Logger) domain.AnalyticsRepository {
	if logger == nil {
		logger = slog.Default()
	}
	return &PostgresFarmAnalyticsRepository{
		pool:   pool,
		logger: logger,
	}
}

func (r *PostgresFarmAnalyticsRepository) GetFarmAnalytics(ctx context.Context, farmID string) (*domain.FarmAnalytics, error) {
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

	var fa domain.FarmAnalytics
	// Pointers for nullable database columns
	var weatherTemp, weatherHumid, weatherWind, weatherRain *float64
	var weatherDesc, weatherIcon, overallStatus *string
	var weatherObservedAt, weatherLastUpdated, invLastUpdated, cropLastUpdated *time.Time

	err := r.pool.QueryRow(ctx, query, farmID).Scan(
		&fa.FarmID, &fa.FarmName, &fa.OwnerID, &fa.FarmType, &fa.TotalSize, &fa.Latitude, &fa.Longitude,
		&weatherTemp, &weatherHumid, &weatherDesc, &weatherIcon,
		&weatherWind, &weatherRain, &weatherObservedAt, &weatherLastUpdated,
		&fa.InventoryInfo.TotalItems, &fa.InventoryInfo.LowStockCount, &invLastUpdated,
		&fa.CropInfo.TotalCount, &fa.CropInfo.GrowingCount, &cropLastUpdated,
		&overallStatus, &fa.AnalyticsLastUpdated,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound // Use domain error
		}
		r.logger.Error("Error fetching farm analytics", "farm_id", farmID, "error", err)
		return nil, fmt.Errorf("database error fetching analytics for farm %s: %w", farmID, err)
	}

	fa.Weather = &domain.WeatherData{
		TempCelsius:        weatherTemp,
		Humidity:           weatherHumid,
		Description:        weatherDesc,
		Icon:               weatherIcon,
		WindSpeed:          weatherWind,
		RainVolume1h:       weatherRain,
		ObservedAt:         weatherObservedAt,
		WeatherLastUpdated: weatherLastUpdated,
	}
	fa.InventoryInfo.LastUpdated = invLastUpdated
	fa.CropInfo.LastUpdated = cropLastUpdated
	fa.OverallStatus = overallStatus

	return &fa, nil
}

func (r *PostgresFarmAnalyticsRepository) CreateOrUpdateFarmBaseData(ctx context.Context, farm *domain.Farm) error {
	query := `
		INSERT INTO public.farm_analytics (
			farm_id, farm_name, owner_id, farm_type, total_size, latitude, longitude, analytics_last_updated
		) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		ON CONFLICT (farm_id) DO UPDATE SET
			farm_name = EXCLUDED.farm_name,
			owner_id = EXCLUDED.owner_id,
			farm_type = EXCLUDED.farm_type,
			total_size = EXCLUDED.total_size,
			latitude = EXCLUDED.latitude,
			longitude = EXCLUDED.longitude,
			analytics_last_updated = NOW()`

	_, err := r.pool.Exec(ctx, query,
		farm.UUID, farm.Name, farm.OwnerID, farm.FarmType, farm.TotalSize, farm.Lat, farm.Lon,
	)
	if err != nil {
		r.logger.Error("Error upserting farm base analytics", "farm_id", farm.UUID, "error", err)
		return fmt.Errorf("failed to save base farm analytics for %s: %w", farm.UUID, err)
	}
	r.logger.Debug("Upserted farm base analytics", "farm_id", farm.UUID)
	return nil
}

func (r *PostgresFarmAnalyticsRepository) UpdateFarmAnalyticsWeather(ctx context.Context, farmID string, weatherData *domain.WeatherData) error {
	if weatherData == nil {
		return errors.New("weather data cannot be nil for update")
	}
	query := `
		UPDATE public.farm_analytics SET
			weather_temp_celsius = $2,
			weather_humidity = $3,
			weather_description = $4,
			weather_icon = $5,
			weather_wind_speed = $6,
			weather_rain_1h = $7,
			weather_observed_at = $8,
			weather_last_updated = NOW(), -- Use current time for the update time
			analytics_last_updated = NOW()
		WHERE farm_id = $1`

	_, err := r.pool.Exec(ctx, query,
		farmID,
		weatherData.TempCelsius,
		weatherData.Humidity,
		weatherData.Description,
		weatherData.Icon,
		weatherData.WindSpeed,
		weatherData.RainVolume1h,
		weatherData.ObservedAt,
	)
	if err != nil {
		r.logger.Error("Error updating farm weather analytics", "farm_id", farmID, "error", err)
		return fmt.Errorf("failed to update weather analytics for farm %s: %w", farmID, err)
	}
	r.logger.Debug("Updated farm weather analytics", "farm_id", farmID)
	return nil
}

func (r *PostgresFarmAnalyticsRepository) UpdateFarmAnalyticsCropStats(ctx context.Context, farmID string) error {
	countQuery := `
		SELECT
			COUNT(*),
			COUNT(*) FILTER (WHERE lower(status) = 'growing')
		FROM public.croplands
		WHERE farm_id = $1
	`
	var totalCount, growingCount int
	err := r.pool.QueryRow(ctx, countQuery, farmID).Scan(&totalCount, &growingCount)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			r.logger.Error("Error calculating crop counts", "farm_id", farmID, "error", err)
			return fmt.Errorf("failed to calculate crop stats for farm %s: %w", farmID, err)
		}
	}

	updateQuery := `
		UPDATE public.farm_analytics SET
			crop_total_count = $2,
			crop_growing_count = $3,
			crop_last_updated = NOW(),
			analytics_last_updated = NOW()
		WHERE farm_id = $1`

	cmdTag, err := r.pool.Exec(ctx, updateQuery, farmID, totalCount, growingCount)
	if err != nil {
		r.logger.Error("Error updating farm crop stats", "farm_id", farmID, "error", err)
		return fmt.Errorf("failed to update crop stats for farm %s: %w", farmID, err)
	}
	if cmdTag.RowsAffected() == 0 {
		r.logger.Warn("No farm analytics record found to update crop stats", "farm_id", farmID)
		// Optionally, create the base record here if it should always exist
		// return r.CreateOrUpdateFarmBaseData(ctx, &domain.Farm{UUID: farmID /* Fetch other details */})
	}

	r.logger.Debug("Updated farm crop stats", "farm_id", farmID, "total", totalCount, "growing", growingCount)
	return nil
}

// TODO: Implement actual count calculation if needed later.
func (r *PostgresFarmAnalyticsRepository) UpdateFarmAnalyticsInventoryStats(ctx context.Context, farmID string) error {
	query := `
		UPDATE public.farm_analytics SET
			-- inventory_total_items = (SELECT COUNT(*) FROM ... WHERE farm_id = $1), -- Example future logic
			-- inventory_low_stock_count = (SELECT COUNT(*) FROM ... WHERE farm_id = $1 AND status = 'low'), -- Example
			inventory_last_updated = NOW(),
			analytics_last_updated = NOW()
		WHERE farm_id = $1`

	cmdTag, err := r.pool.Exec(ctx, query, farmID)
	if err != nil {
		r.logger.Error("Error touching inventory timestamp in farm analytics", "farm_id", farmID, "error", err)
		return fmt.Errorf("failed to update inventory stats timestamp for farm %s: %w", farmID, err)
	}
	if cmdTag.RowsAffected() == 0 {
		r.logger.Warn("No farm analytics record found to update inventory timestamp", "farm_id", farmID)
	}

	r.logger.Debug("Updated farm inventory timestamp", "farm_id", farmID)
	return nil
}

func (r *PostgresFarmAnalyticsRepository) DeleteFarmAnalytics(ctx context.Context, farmID string) error {
	query := `DELETE FROM public.farm_analytics WHERE farm_id = $1`
	_, err := r.pool.Exec(ctx, query, farmID)
	if err != nil {
		r.logger.Error("Error deleting farm analytics", "farm_id", farmID, "error", err)
		return fmt.Errorf("failed to delete analytics for farm %s: %w", farmID, err)
	}
	r.logger.Debug("Deleted farm analytics", "farm_id", farmID)
	return nil
}

func (r *PostgresFarmAnalyticsRepository) UpdateFarmOverallStatus(ctx context.Context, farmID string, status string) error {
	query := `
		UPDATE public.farm_analytics SET
			overall_status = $2,
			analytics_last_updated = NOW()
		WHERE farm_id = $1`

	cmdTag, err := r.pool.Exec(ctx, query, farmID, status)
	if err != nil {
		r.logger.Error("Error updating farm overall status", "farm_id", farmID, "status", status, "error", err)
		return fmt.Errorf("failed to update overall status for farm %s: %w", farmID, err)
	}
	if cmdTag.RowsAffected() == 0 {
		r.logger.Warn("No farm analytics record found to update overall status", "farm_id", farmID)
	}
	r.logger.Debug("Updated farm overall status", "farm_id", farmID, "status", status)
	return nil
}
