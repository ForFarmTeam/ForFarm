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

const openWeatherMapCurrentAPIURL = "https://api.openweathermap.org/data/2.5/weather"

type openWeatherMapCurrentResponse struct {
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
	Main *struct {
		Temp      float64 `json:"temp"`
		FeelsLike float64 `json:"feels_like"`
		TempMin   float64 `json:"temp_min"`
		TempMax   float64 `json:"temp_max"`
		Pressure  int     `json:"pressure"`
		Humidity  int     `json:"humidity"`
		SeaLevel  int     `json:"sea_level,omitempty"`
		GrndLevel int     `json:"grnd_level,omitempty"`
	} `json:"main"`
	Visibility int `json:"visibility"`
	Wind       *struct {
		Speed float64 `json:"speed"`
		Deg   int     `json:"deg"`
		Gust  float64 `json:"gust,omitempty"`
	} `json:"wind"`
	Rain *struct {
		OneH float64 `json:"1h"`
	} `json:"rain,omitempty"`
	Snow *struct {
		OneH float64 `json:"1h"`
	} `json:"snow,omitempty"`
	Clouds *struct {
		All int `json:"all"`
	} `json:"clouds"`
	Dt  int64 `json:"dt"`
	Sys *struct {
		Type    int    `json:"type,omitempty"`
		ID      int    `json:"id,omitempty"`
		Country string `json:"country"`
		Sunrise int64  `json:"sunrise"`
		Sunset  int64  `json:"sunset"`
	} `json:"sys"`
	Timezone int    `json:"timezone"`
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Cod      int    `json:"cod"`
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

	fullURL := fmt.Sprintf("%s?%s", openWeatherMapCurrentAPIURL, queryParams.Encode())
	f.logger.Debug("Fetching weather from OpenWeatherMap Current API", "url", fullURL)

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
		bodyBytes, _ := io.ReadAll(resp.Body)
		f.logger.Error("OpenWeatherMap API returned non-OK status",
			"url", fullURL,
			"status_code", resp.StatusCode,
			"body", string(bodyBytes))
		return nil, fmt.Errorf("weather API request failed with status: %s", resp.Status)
	}

	var owmResp openWeatherMapCurrentResponse
	if err := json.NewDecoder(resp.Body).Decode(&owmResp); err != nil {
		f.logger.Error("Failed to decode OpenWeatherMap Current response", "error", err)
		return nil, fmt.Errorf("failed to decode weather response: %w", err)
	}

	// --- Data Mapping from openWeatherMapCurrentResponse to domain.WeatherData ---

	if owmResp.Main == nil {
		f.logger.Error("OpenWeatherMap Current response missing 'main' data block", "lat", lat, "lon", lon)
		return nil, fmt.Errorf("main weather data block not found in API response")
	}

	weatherData := &domain.WeatherData{}

	weatherData.TempCelsius = &owmResp.Main.Temp
	humidityFloat := float64(owmResp.Main.Humidity)
	weatherData.Humidity = &humidityFloat

	if len(owmResp.Weather) > 0 {
		weatherData.Description = &owmResp.Weather[0].Description
		weatherData.Icon = &owmResp.Weather[0].Icon
	} else {
		f.logger.Warn("OpenWeatherMap Current response missing 'weather' description details", "lat", lat, "lon", lon)
	}

	if owmResp.Wind != nil {
		weatherData.WindSpeed = &owmResp.Wind.Speed
	} else {
		f.logger.Warn("OpenWeatherMap Current response missing 'wind' data block", "lat", lat, "lon", lon)
	}

	if owmResp.Rain != nil {
		weatherData.RainVolume1h = &owmResp.Rain.OneH
	}

	observedTime := time.Unix(owmResp.Dt, 0).UTC()
	weatherData.ObservedAt = &observedTime
	now := time.Now().UTC()
	weatherData.WeatherLastUpdated = &now

	logTemp := "nil"
	if weatherData.TempCelsius != nil {
		logTemp = fmt.Sprintf("%.2f", *weatherData.TempCelsius)
	}
	logDesc := "nil"
	if weatherData.Description != nil {
		logDesc = *weatherData.Description
	}
	f.logger.Debug("Successfully fetched and mapped weather data",
		"lat", lat,
		"lon", lon,
		"temp", logTemp,
		"description", logDesc)

	return weatherData, nil
}
