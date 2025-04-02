// backend/internal/workers/weather_updater.go
package workers

import (
	"context"
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
) *WeatherUpdater {
	if logger == nil {
		logger = slog.Default()
	}
	if fetchInterval <= 0 {
		fetchInterval = 15 * time.Minute
	}
	return &WeatherUpdater{
		farmRepo:       farmRepo,
		weatherFetcher: weatherFetcher,
		eventPublisher: eventPublisher,
		logger:         logger,
		fetchInterval:  fetchInterval,
		stopChan:       make(chan struct{}),
	}
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
	close(w.stopChan)
	w.wg.Wait()
	w.logger.Info("Weather Updater worker stopped")
}

func (w *WeatherUpdater) fetchAndUpdateAllFarms(ctx context.Context) {
	// Use a background context for the repository call if the main context might cancel prematurely
	// repoCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second) // Example timeout
	// defer cancel()

	// TODO: Need a GetAllFarms method in the FarmRepository or a way to efficiently get all farm locations.
	farms, err := w.farmRepo.GetByOwnerID(ctx, "") // !! REPLACE with a proper GetAll method !!
	if err != nil {
		w.logger.Error("Failed to get farms for weather update", "error", err)
		return
	}
	if len(farms) == 0 {
		w.logger.Info("No farms found to update weather for.")
		return
	}

	w.logger.Info("Found farms for weather update", "count", len(farms))

	var fetchWg sync.WaitGroup
	fetchCtx, cancelFetches := context.WithCancel(ctx)
	defer cancelFetches()

	for _, farm := range farms {
		if farm.Lat == 0 && farm.Lon == 0 {
			w.logger.Warn("Skipping farm with zero coordinates", "farm_id", farm.UUID, "farm_name", farm.Name)
			continue
		}

		fetchWg.Add(1)
		go func(f domain.Farm) {
			defer fetchWg.Done()
			select {
			case <-fetchCtx.Done():
				return
			default:
				w.fetchAndPublishWeather(fetchCtx, f)
			}
		}(farm)
	}

	fetchWg.Wait()
	w.logger.Info("Finished weather fetch cycle for farms", "count", len(farms))
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
		"farm_id":              farm.UUID,
		"lat":                  farm.Lat,
		"lon":                  farm.Lon,
		"temp_celsius":         weatherData.TempCelsius,
		"humidity":             weatherData.Humidity,
		"description":          weatherData.Description,
		"icon":                 weatherData.Icon,
		"wind_speed":           weatherData.WindSpeed,
		"rain_volume_1h":       weatherData.RainVolume1h,
		"observed_at":          weatherData.ObservedAt,
		"weather_last_updated": weatherData.WeatherLastUpdated,
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
