package domain

import (
	"context"
	"time"
)

type WeatherData struct {
	TempCelsius        *float64   `json:"temp_celsius,omitempty"`
	Humidity           *float64   `json:"humidity,omitempty"`
	Description        *string    `json:"description,omitempty"`
	Icon               *string    `json:"icon,omitempty"`
	WindSpeed          *float64   `json:"wind_speed,omitempty"`
	RainVolume1h       *float64   `json:"rain_volume_1h,omitempty"`
	ObservedAt         *time.Time `json:"observed_at,omitempty"`
	WeatherLastUpdated *time.Time `json:"weather_last_updated,omitempty"`
}

type WeatherFetcher interface {
	GetCurrentWeatherByCoords(ctx context.Context, lat, lon float64) (*WeatherData, error)
}
