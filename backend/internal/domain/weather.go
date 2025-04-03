package domain

import (
	"context"
	"time"
)

type WeatherData struct {
	TempCelsius        *float64   `json:"tempCelsius,omitempty"`
	Humidity           *float64   `json:"humidity,omitempty"`
	Description        *string    `json:"description,omitempty"`
	Icon               *string    `json:"icon,omitempty"`
	WindSpeed          *float64   `json:"windSpeed,omitempty"`
	RainVolume1h       *float64   `json:"rainVolume1h,omitempty"`
	ObservedAt         *time.Time `json:"observedAt,omitempty"`
	WeatherLastUpdated *time.Time `json:"weatherLastUpdated,omitempty"`
}

type WeatherFetcher interface {
	GetCurrentWeatherByCoords(ctx context.Context, lat, lon float64) (*WeatherData, error)
}
