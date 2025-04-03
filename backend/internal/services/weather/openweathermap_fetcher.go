// backend/internal/services/weather/openweathermap_fetcher.go
package weather

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"time"

	"github.com/forfarm/backend/internal/domain"
)

const openWeatherMapOneCallAPIURL = "https://api.openweathermap.org/data/3.0/onecall"

type openWeatherMapOneCallResponse struct {
	Lat            float64 `json:"lat"`
	Lon            float64 `json:"lon"`
	Timezone       string  `json:"timezone"`
	TimezoneOffset int     `json:"timezone_offset"`
	Current        *struct {
		Dt         int64   `json:"dt"` // Current time, Unix, UTC
		Sunrise    int64   `json:"sunrise"`
		Sunset     int64   `json:"sunset"`
		Temp       float64 `json:"temp"`       // Kelvin by default, 'units=metric' for Celsius
		FeelsLike  float64 `json:"feels_like"` // Kelvin by default
		Pressure   int     `json:"pressure"`   // hPa
		Humidity   int     `json:"humidity"`   // %
		DewPoint   float64 `json:"dew_point"`
		Uvi        float64 `json:"uvi"`
		Clouds     int     `json:"clouds"`     // %
		Visibility int     `json:"visibility"` // meters
		WindSpeed  float64 `json:"wind_speed"` // meter/sec by default
		WindDeg    int     `json:"wind_deg"`
		WindGust   float64 `json:"wind_gust,omitempty"`
		Rain       *struct {
			OneH float64 `json:"1h"` // Rain volume for the last 1 hour, mm
		} `json:"rain,omitempty"`
		Snow *struct {
			OneH float64 `json:"1h"` // Snow volume for the last 1 hour, mm
		} `json:"snow,omitempty"`
		Weather []struct {
			ID          int    `json:"id"`
			Main        string `json:"main"`
			Description string `json:"description"`
			Icon        string `json:"icon"`
		} `json:"weather"`
	} `json:"current,omitempty"`
	// Minutely []...
	// Hourly   []...
	// Daily    []...
	// Alerts   []...
}

type OpenWeatherMapFetcher struct {
	apiKey string
	client *http.Client
	logger *slog.Logger
}

func NewOpenWeatherMapFetcher(apiKey string, client *http.Client, logger *slog.Logger) domain.WeatherFetcher {
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}
	if logger == nil {
		logger = slog.Default()
	}
	return &OpenWeatherMapFetcher{
		apiKey: apiKey,
		client: client,
		logger: logger,
	}
}

func (f *OpenWeatherMapFetcher) GetCurrentWeatherByCoords(ctx context.Context, lat, lon float64) (*domain.WeatherData, error) {
	queryParams := url.Values{}
	queryParams.Set("lat", fmt.Sprintf("%.4f", lat))
	queryParams.Set("lon", fmt.Sprintf("%.4f", lon))
	queryParams.Set("appid", f.apiKey)
	queryParams.Set("units", "metric")                         // Request Celsius and m/s
	queryParams.Set("exclude", "minutely,hourly,daily,alerts") // Exclude parts we don't need now

	fullURL := fmt.Sprintf("%s?%s", openWeatherMapOneCallAPIURL, queryParams.Encode())
	f.logger.Debug("Fetching weather from OpenWeatherMap OneCall API", "url", fullURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fullURL, nil)
	if err != nil {
		f.logger.Error("Failed to create OpenWeatherMap request", "error", err)
		return nil, fmt.Errorf("failed to create weather request: %w", err)
	}

	resp, err := f.client.Do(req)
	if err != nil {
		f.logger.Error("Failed to execute OpenWeatherMap request", "url", fullURL, "error", err)
		return nil, fmt.Errorf("failed to fetch weather data: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// TODO: Read resp.Body to get error message from OpenWeatherMap
		bodyBytes, _ := io.ReadAll(resp.Body)
		f.logger.Error("OpenWeatherMap API returned non-OK status",
			"url", fullURL,
			"status_code", resp.StatusCode,
			"body", string(bodyBytes))
		return nil, fmt.Errorf("weather API request failed with status: %s", resp.Status)
	}

	var owmResp openWeatherMapOneCallResponse
	if err := json.NewDecoder(resp.Body).Decode(&owmResp); err != nil {
		f.logger.Error("Failed to decode OpenWeatherMap OneCall response", "error", err)
		return nil, fmt.Errorf("failed to decode weather response: %w", err)
	}

	if owmResp.Current == nil {
		f.logger.Warn("OpenWeatherMap OneCall response missing 'current' weather data", "lat", lat, "lon", lon)
		return nil, fmt.Errorf("current weather data not found in API response")
	}
	current := owmResp.Current

	if len(current.Weather) == 0 {
		f.logger.Warn("OpenWeatherMap response missing weather description details", "lat", lat, "lon", lon)
		return nil, fmt.Errorf("weather data description not found in response")
	}

	// Create domain object using pointers for optional fields
	weatherData := &domain.WeatherData{} // Initialize empty struct first

	// Assign values using pointers, checking for nil where appropriate
	weatherData.TempCelsius = &current.Temp
	humidityFloat := float64(current.Humidity)
	weatherData.Humidity = &humidityFloat
	weatherData.Description = &current.Weather[0].Description
	weatherData.Icon = &current.Weather[0].Icon
	weatherData.WindSpeed = &current.WindSpeed
	if current.Rain != nil {
		weatherData.RainVolume1h = &current.Rain.OneH
	}
	observedTime := time.Unix(current.Dt, 0).UTC()
	weatherData.ObservedAt = &observedTime
	now := time.Now().UTC()
	weatherData.WeatherLastUpdated = &now

	f.logger.Debug("Successfully fetched weather data",
		"lat", lat,
		"lon", lon,
		"temp", *weatherData.TempCelsius,
		"description", *weatherData.Description)

	return weatherData, nil
}
