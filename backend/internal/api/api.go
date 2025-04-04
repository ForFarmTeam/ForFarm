package api

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/forfarm/backend/internal/cache"
	"github.com/forfarm/backend/internal/config"
	"github.com/forfarm/backend/internal/domain"
	m "github.com/forfarm/backend/internal/middlewares"
	"github.com/forfarm/backend/internal/repository"
	"github.com/forfarm/backend/internal/services"
	"github.com/forfarm/backend/internal/services/weather"
	"github.com/forfarm/backend/internal/utilities"
)

type api struct {
	logger         *slog.Logger
	httpClient     *http.Client
	eventPublisher domain.EventPublisher
	cache          cache.Cache

	userRepo         domain.UserRepository
	cropRepo         domain.CroplandRepository
	farmRepo         domain.FarmRepository
	plantRepo        domain.PlantRepository
	inventoryRepo    domain.InventoryRepository
	harvestRepo      domain.HarvestRepository
	analyticsRepo    domain.AnalyticsRepository
	knowledgeHubRepo domain.KnowledgeHubRepository

	weatherFetcher domain.WeatherFetcher

	chatService *services.ChatService
}

func (a *api) GetWeatherFetcher() domain.WeatherFetcher {
	return a.weatherFetcher
}

func NewAPI(
	ctx context.Context,
	logger *slog.Logger,
	pool *pgxpool.Pool,
	eventPublisher domain.EventPublisher,
	analyticsRepo domain.AnalyticsRepository,
	farmRepo domain.FarmRepository,
) *api {

	client := &http.Client{}

	logger.Info("creating memory cache")
	memoryCache := cache.NewMemoryCache(1*time.Hour, 2*time.Hour)

	userRepository := repository.NewPostgresUser(pool)
	plantRepository := repository.NewPostgresPlant(pool, memoryCache)
	inventoryRepo := repository.NewPostgresInventory(pool, eventPublisher, memoryCache)
	harvestRepository := repository.NewPostgresHarvest(pool, memoryCache)
	knowledgeHubRepository := repository.NewPostgresKnowledgeHub(pool)
	croplandRepo := repository.NewPostgresCropland(pool)
	croplandRepo.SetEventPublisher(eventPublisher)

	owmFetcher := weather.NewOpenWeatherMapFetcher(config.OPENWEATHER_API_KEY, client, logger)
	cacheTTL, err := time.ParseDuration(config.OPENWEATHER_CACHE_TTL)
	if err != nil {
		logger.Warn("Invalid OPENWEATHER_CACHE_TTL format, using default 15m", "value", config.OPENWEATHER_CACHE_TTL, "error", err)
		cacheTTL = 15 * time.Minute
	}
	cleanupInterval := cacheTTL * 2
	if cleanupInterval < 5*time.Minute {
		cleanupInterval = 5 * time.Minute
	}
	cachedWeatherFetcher := weather.NewCachedWeatherFetcher(owmFetcher, cacheTTL, cleanupInterval, logger)

	chatService, chatErr := services.NewChatService(logger, analyticsRepo, farmRepo, croplandRepo, inventoryRepo, plantRepository)
	if chatErr != nil {
		logger.Error("Failed to initialize ChatService", "error", chatErr)
		chatService = nil
	}

	return &api{
		logger:         logger,
		httpClient:     client,
		eventPublisher: eventPublisher,
		cache:          memoryCache,

		userRepo:         userRepository,
		cropRepo:         croplandRepo,
		farmRepo:         farmRepo,
		plantRepo:        plantRepository,
		inventoryRepo:    inventoryRepo,
		harvestRepo:      harvestRepository,
		analyticsRepo:    analyticsRepo,
		knowledgeHubRepo: knowledgeHubRepository,
		weatherFetcher:   cachedWeatherFetcher,

		chatService: chatService,
	}
}

func (a *api) getUserIDFromHeader(authHeader string) (string, error) {
	const bearerPrefix = "Bearer "
	if !strings.HasPrefix(authHeader, bearerPrefix) {
		return "", errors.New("invalid authorization header")
	}
	tokenString := strings.TrimPrefix(authHeader, bearerPrefix)
	return utilities.ExtractUUIDFromToken(tokenString)
}

func (a *api) Server(port int) *http.Server {
	return &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: a.Routes()}
}

func (a *api) Routes() *chi.Mux {
	router := chi.NewRouter()
	router.Use(middleware.Logger)

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// --- Add Rate Limiter Middleware ---
	if config.RATE_LIMIT_ENABLED {
		a.logger.Info("Rate limiting enabled",
			"rps", config.RATE_LIMIT_RPS,
			"ttl", config.RATE_LIMIT_TTL)

		router.Use(httprate.Limit(
			config.RATE_LIMIT_RPS,
			config.RATE_LIMIT_TTL,
			httprate.WithKeyFuncs(httprate.KeyByIP),
		))
	} else {
		a.logger.Info("Rate limiting is disabled")
	} // --- End Rate Limiter Middleware ---

	humaConfig := huma.DefaultConfig("ForFarm Public API", "v1.0.0")
	api := humachi.New(router, humaConfig)

	router.Group(func(r chi.Router) {
		a.registerAuthRoutes(r, api)
		a.registerCropRoutes(r, api)
		a.registerPlantRoutes(r, api)
		a.registerKnowledgeHubRoutes(r, api)
		a.registerOauthRoutes(r, api)
		a.registerChatRoutes(r, api)
		a.registerInventoryRoutes(r, api)
		a.registerHealthRoutes(r, api)
	})

	router.Group(func(r chi.Router) {
		api.UseMiddleware(m.AuthMiddleware(api))
		a.registerFarmRoutes(r, api)
		a.registerUserRoutes(r, api)
		a.registerAnalyticsRoutes(r, api)
	})

	return router
}
