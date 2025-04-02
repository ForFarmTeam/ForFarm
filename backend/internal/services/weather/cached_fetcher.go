package weather

import (
	"context"
	"fmt"
	"time"

	"log/slog"

	"github.com/forfarm/backend/internal/domain"
	"github.com/patrickmn/go-cache"
)

type CachedWeatherFetcher struct {
	next   domain.WeatherFetcher
	cache  *cache.Cache
	logger *slog.Logger
}

func NewCachedWeatherFetcher(fetcher domain.WeatherFetcher, ttl time.Duration, cleanupInterval time.Duration, logger *slog.Logger) domain.WeatherFetcher {
	c := cache.New(ttl, cleanupInterval)
	return &CachedWeatherFetcher{
		next:   fetcher,
		cache:  c,
		logger: logger,
	}
}

func (f *CachedWeatherFetcher) GetCurrentWeatherByCoords(ctx context.Context, lat, lon float64) (*domain.WeatherData, error) {
	cacheKey := fmt.Sprintf("weather_coords_%.4f_%.4f", lat, lon)

	if data, found := f.cache.Get(cacheKey); found {
		if weatherData, ok := data.(*domain.WeatherData); ok {
			return weatherData, nil
		}
		f.logger.Warn("Invalid data type found in weather cache", "key", cacheKey)
	}

	f.logger.Debug("Cache miss for weather data", "key", cacheKey)

	weatherData, err := f.next.GetCurrentWeatherByCoords(ctx, lat, lon)
	if err != nil {
		return nil, err
	}

	if weatherData != nil {
		f.cache.Set(cacheKey, weatherData, cache.DefaultExpiration) // Uses the TTL set during cache creation
		f.logger.Debug("Stored fetched weather data in cache", "key", cacheKey)
	}

	return weatherData, nil
}
