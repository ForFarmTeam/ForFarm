// backend/internal/workers/weather_updater.go
package workers

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/forfarm/backend/internal/domain"
	"github.com/google/uuid"
)

type WeatherUpdater struct {
	farmRepo       domain.FarmRepository
	weatherFetcher domain.WeatherFetcher
	eventPublisher domain.EventPublisher
	logger         *slog.Logger
	fetchInterval  time.Duration
	stopChan       chan struct{} // Channel to signal stopping
	wg             sync.WaitGroup
}

func NewWeatherUpdater(
	farmRepo domain.FarmRepository,
	weatherFetcher domain.WeatherFetcher,
	eventPublisher domain.EventPublisher,
	logger *slog.Logger,
	fetchInterval time.Duration,
) (*WeatherUpdater, error) {
	if logger == nil {
		logger = slog.Default()
	}
	if fetchInterval <= 0 {
		fetchInterval = 60 * time.Minute
	}
	if farmRepo == nil {
		return nil, fmt.Errorf("farmRepo cannot be nil")
	}
	if weatherFetcher == nil {
		return nil, fmt.Errorf("weatherFetcher cannot be nil")
	}
	if eventPublisher == nil {
		return nil, fmt.Errorf("eventPublisher cannot be nil")
	}

	return &WeatherUpdater{
		farmRepo:       farmRepo,
		weatherFetcher: weatherFetcher,
		eventPublisher: eventPublisher,
		logger:         logger,
		fetchInterval:  fetchInterval,
		stopChan:       make(chan struct{}),
	}, nil
}

func (w *WeatherUpdater) Start(ctx context.Context) {
	w.logger.Info("Starting Weather Updater worker", "interval", w.fetchInterval)
	ticker := time.NewTicker(w.fetchInterval)

	w.wg.Add(1)

	go func() {
		defer w.wg.Done()
		defer ticker.Stop()
		w.logger.Info("Weather Updater goroutine started")

		w.fetchAndUpdateAllFarms(ctx)

		for {
			select {
			case <-ticker.C:
				w.logger.Info("Weather Updater tick: fetching weather data")
				w.fetchAndUpdateAllFarms(ctx)
			case <-w.stopChan:
				w.logger.Info("Weather Updater received stop signal, stopping...")
				return
			case <-ctx.Done():
				w.logger.Info("Weather Updater context cancelled, stopping...", "reason", ctx.Err())
				return
			}
		}
	}()
}

func (w *WeatherUpdater) Stop() {
	w.logger.Info("Attempting to stop Weather Updater worker...")
	select {
	case <-w.stopChan:
	default:
		close(w.stopChan)
	}
	w.wg.Wait() // Wait for the goroutine to finish
	w.logger.Info("Weather Updater worker stopped")
}

func (w *WeatherUpdater) fetchAndUpdateAllFarms(ctx context.Context) {
	repoCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second) // Use separate context for DB query
	defer cancel()

	farms, err := w.farmRepo.GetAll(repoCtx) // <-- Changed method call
	if err != nil {
		w.logger.Error("Failed to get all farms for weather update", "error", err)
		return
	}
	if len(farms) == 0 {
		w.logger.Info("No farms found to update weather for.")
		return
	}

	w.logger.Info("Processing farms for weather update", "count", len(farms))

	var fetchWg sync.WaitGroup
	fetchCtx, cancelFetches := context.WithCancel(ctx)
	defer cancelFetches()

	concurrencyLimit := 5
	sem := make(chan struct{}, concurrencyLimit)

	for _, farm := range farms {
		if farm.Lat == 0 && farm.Lon == 0 {
			w.logger.Warn("Skipping farm with zero coordinates", "farm_id", farm.UUID, "farm_name", farm.Name)
			continue
		}

		fetchWg.Add(1)
		sem <- struct{}{}
		go func(f domain.Farm) {
			defer fetchWg.Done()
			defer func() { <-sem }()

			select {
			case <-fetchCtx.Done():
				w.logger.Info("Weather fetch cancelled for farm", "farm_id", f.UUID, "reason", fetchCtx.Err())
				return
			default:
				w.fetchAndPublishWeather(fetchCtx, f)
			}
		}(farm)
	}

	fetchWg.Wait()
	w.logger.Debug("Finished weather fetch cycle for farms", "count", len(farms)) // Use Debug for cycle completion
}

func (w *WeatherUpdater) fetchAndPublishWeather(ctx context.Context, farm domain.Farm) {
	weatherData, err := w.weatherFetcher.GetCurrentWeatherByCoords(ctx, farm.Lat, farm.Lon)
	if err != nil {
		w.logger.Error("Failed to fetch weather data", "farm_id", farm.UUID, "lat", farm.Lat, "lon", farm.Lon, "error", err)
		return
	}
	if weatherData == nil {
		w.logger.Warn("Received nil weather data without error", "farm_id", farm.UUID)
		return
	}

	payloadMap := map[string]interface{}{
		"farm_id":            farm.UUID,
		"lat":                farm.Lat,
		"lon":                farm.Lon,
		"tempCelsius":        weatherData.TempCelsius,
		"humidity":           weatherData.Humidity,
		"description":        weatherData.Description,
		"icon":               weatherData.Icon,
		"windSpeed":          weatherData.WindSpeed,
		"rainVolume1h":       weatherData.RainVolume1h,
		"observedAt":         weatherData.ObservedAt,
		"weatherLastUpdated": weatherData.WeatherLastUpdated,
	}

	event := domain.Event{
		ID:          uuid.NewString(),
		Type:        "weather.updated",
		Source:      "weather-updater-worker",
		Timestamp:   time.Now().UTC(),
		AggregateID: farm.UUID,
		Payload:     payloadMap,
	}

	pubCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = w.eventPublisher.Publish(pubCtx, event)
	if err != nil {
		w.logger.Error("Failed to publish weather.updated event", "farm_id", farm.UUID, "event_id", event.ID, "error", err)
	} else {
		w.logger.Debug("Published weather.updated event", "farm_id", farm.UUID, "event_id", event.ID)
	}
}
