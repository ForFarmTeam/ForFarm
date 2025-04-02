package weather

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"time"

	"github.com/forfarm/backend/internal/domain"
)

const openWeatherMapAPIURL = "https://api.openweathermap.org/data/2.5/weather"

type openWeatherMapResponse struct {
	Coord struct {
		Lon float64 `json:"lon"`
		Lat float64 `json:"lat"`
	} `json:"coord"`
	Weather []struct {
		ID          int    `json:"id"`
		Main        string `json:"main"`
		Description string `json:"description"`
		Icon        string `json:"icon"`
	} `json:"weather"`
	Base string `json:"base"`
	Main struct {
		Temp      float64 `json:"temp"`       // Kelvin by default
		FeelsLike float64 `json:"feels_like"` // Kelvin by default
		TempMin   float64 `json:"temp_min"`   // Kelvin by default
		TempMax   float64 `json:"temp_max"`   // Kelvin by default
		Pressure  int     `json:"pressure"`   // hPa
		Humidity  int     `json:"humidity"`   // %
		SeaLevel  int     `json:"sea_level"`  // hPa
		GrndLevel int     `json:"grnd_level"` // hPa
	} `json:"main"`
	Visibility int `json:"visibility"` // meters
	Wind       struct {
		Speed float64 `json:"speed"` // meter/sec
		Deg   int     `json:"deg"`   // degrees (meteorological)
		Gust  float64 `json:"gust"`  // meter/sec
	} `json:"wind"`
	Rain struct {
		OneH float64 `json:"1h"` // Rain volume for the last 1 hour, mm
	} `json:"rain"`
	Clouds struct {
		All int `json:"all"` // %
	} `json:"clouds"`
	Dt  int64 `json:"dt"` // Time of data calculation, unix, UTC
	Sys struct {
		Type    int    `json:"type"`
		ID      int    `json:"id"`
		Country string `json:"country"`
		Sunrise int64  `json:"sunrise"` // unix, UTC
		Sunset  int64  `json:"sunset"`  // unix, UTC
	} `json:"sys"`
	Timezone int    `json:"timezone"` // Shift in seconds from UTC
	ID       int    `json:"id"`       // City ID
	Name     string `json:"name"`     // City name
	Cod      int    `json:"cod"`      // Internal parameter
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
	queryParams.Set("units", "metric")

	fullURL := fmt.Sprintf("%s?%s", openWeatherMapAPIURL, queryParams.Encode())

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
		f.logger.Error("OpenWeatherMap API returned non-OK status", "url", fullURL, "status_code", resp.StatusCode)
		return nil, fmt.Errorf("weather API request failed with status: %s", resp.Status)
	}

	var owmResp openWeatherMapResponse
	if err := json.NewDecoder(resp.Body).Decode(&owmResp); err != nil {
		f.logger.Error("Failed to decode OpenWeatherMap response", "error", err)
		return nil, fmt.Errorf("failed to decode weather response: %w", err)
	}

	if len(owmResp.Weather) == 0 {
		f.logger.Warn("OpenWeatherMap response missing weather details", "lat", lat, "lon", lon)
		return nil, fmt.Errorf("weather data description not found in response")
	}

	weatherData := &domain.WeatherData{
		Timestamp:    time.Unix(owmResp.Dt, 0).UTC(),
		TempCelsius:  owmResp.Main.Temp,
		Humidity:     float64(owmResp.Main.Humidity),
		Description:  owmResp.Weather[0].Description,
		Icon:         owmResp.Weather[0].Icon,
		WindSpeed:    owmResp.Wind.Speed,
		RainVolume1h: owmResp.Rain.OneH,
	}

	f.logger.Debug("Successfully fetched weather data",
		"lat", lat,
		"lon", lon,
		"temp", weatherData.TempCelsius,
		"description", weatherData.Description)

	return weatherData, nil
}
