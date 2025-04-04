// backend/internal/cmd/api.go
package cmd

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/spf13/cobra"

	"github.com/forfarm/backend/internal/api"
	"github.com/forfarm/backend/internal/cmdutil"
	"github.com/forfarm/backend/internal/config"
	"github.com/forfarm/backend/internal/event"
	"github.com/forfarm/backend/internal/repository"
	"github.com/forfarm/backend/internal/services"
	"github.com/forfarm/backend/internal/workers"
)

func APICmd(ctx context.Context) *cobra.Command {
	var port int = config.PORT

	cmd := &cobra.Command{
		Use:   "api",
		Args:  cobra.ExactArgs(0),
		Short: "Run RESTful API",
		RunE: func(cmd *cobra.Command, args []string) error {
			logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

			pool, err := cmdutil.NewDatabasePool(ctx, 16)
			if err != nil {
				logger.Error("failed to create database pool", "error", err)
				return err
			}
			defer pool.Close()
			logger.Info("connected to database")

			// --- Event Bus ---
			eventBus, err := event.NewRabbitMQEventBus(config.RABBITMQ_URL, logger)
			if err != nil {
				logger.Error("failed to connect to event bus", "url", config.RABBITMQ_URL, "error", err)
				return fmt.Errorf("event bus connection failed: %w", err)
			}
			defer eventBus.Close()
			logger.Info("connected to event bus", "url", config.RABBITMQ_URL)

			logger.Info("starting AnalyticService worker for farm-crop analytics")
			analyticService := services.NewAnalyticsService()

			analyticsRepo := repository.NewPostgresFarmAnalyticsRepository(pool, logger, analyticService)

			farmRepo := repository.NewPostgresFarm(pool)
			farmRepo.SetEventPublisher(eventBus)

			projection := event.NewFarmAnalyticsProjection(eventBus, analyticsRepo, logger)
			go func() {
				if err := projection.Start(ctx); err != nil {
					logger.Error("FarmAnalyticsProjection failed to start listening", "error", err)
				}
			}()
			logger.Info("Farm Analytics Projection started")

			apiInstance := api.NewAPI(ctx, logger, pool, eventBus, analyticsRepo, farmRepo)

			weatherFetcher := apiInstance.GetWeatherFetcher()
			weatherInterval, err := time.ParseDuration(config.WEATHER_FETCH_INTERVAL)
			if err != nil {
				logger.Warn("Invalid WEATHER_FETCH_INTERVAL, using default 15m", "value", config.WEATHER_FETCH_INTERVAL, "error", err)
				weatherInterval = 15 * time.Minute
			}
			weatherUpdater, err := workers.NewWeatherUpdater(farmRepo, weatherFetcher, eventBus, logger, weatherInterval)
			if err != nil {
				logger.Error("failed to create WeatherUpdater", "error", err)
			}
			weatherUpdater.Start(ctx)
			logger.Info("Weather Updater worker started", "interval", weatherInterval)

			server := apiInstance.Server(port)

			serverErrChan := make(chan error, 1)
			go func() {
				logger.Info("starting API server", "port", port)
				if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					logger.Error("API server failed", "error", err)
					serverErrChan <- err
				}
				close(serverErrChan)
			}()

			select {
			case err := <-serverErrChan:
				logger.Error("Server error received, initiating shutdown.", "error", err)
			case <-ctx.Done():
				logger.Info("Shutdown signal received, initiating graceful shutdown...")

				shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
				defer cancel()

				weatherUpdater.Stop()
				if err := server.Shutdown(shutdownCtx); err != nil {
					logger.Error("HTTP server graceful shutdown failed", "error", err)
				} else {
					logger.Info("HTTP server shutdown complete.")
				}

			}

			logger.Info("Application shutdown complete.")
			return nil
		},
	}

	// Add flags if needed (e.g., --port)
	// cmd.Flags().IntVarP(&port, "port", "p", config.PORT, "Port for the API server")

	return cmd
}
