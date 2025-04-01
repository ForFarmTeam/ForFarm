package api

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/forfarm/backend/internal/domain"
	m "github.com/forfarm/backend/internal/middlewares"
	"github.com/forfarm/backend/internal/repository"
	"github.com/forfarm/backend/internal/utilities"
)

type api struct {
	logger         *slog.Logger
	httpClient     *http.Client
	eventPublisher domain.EventPublisher

	userRepo      domain.UserRepository
	cropRepo      domain.CroplandRepository
	farmRepo      domain.FarmRepository
	plantRepo     domain.PlantRepository
	inventoryRepo domain.InventoryRepository
	harvestRepo   domain.HarvestRepository
}

func NewAPI(ctx context.Context, logger *slog.Logger, pool *pgxpool.Pool, eventPublisher domain.EventPublisher) *api {

	client := &http.Client{}

	userRepository := repository.NewPostgresUser(pool)
	croplandRepository := repository.NewPostgresCropland(pool)
	farmRepository := repository.NewPostgresFarm(pool)
	plantRepository := repository.NewPostgresPlant(pool)
	inventoryRepository := repository.NewPostgresInventory(pool)
	harvestRepository := repository.NewPostgresHarvest(pool)

	farmRepository.SetEventPublisher(eventPublisher)

	return &api{
		logger:         logger,
		httpClient:     client,
		eventPublisher: eventPublisher,

		userRepo:      userRepository,
		cropRepo:      croplandRepository,
		farmRepo:      farmRepository,
		plantRepo:     plantRepository,
		inventoryRepo: inventoryRepository,
		harvestRepo:   harvestRepository,
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
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*", "http://localhost:3000"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	config := huma.DefaultConfig("ForFarm Public API", "v1.0.0")
	api := humachi.New(router, config)

	router.Group(func(r chi.Router) {
		a.registerAuthRoutes(r, api)
		a.registerCropRoutes(r, api)
		a.registerPlantRoutes(r, api)
		a.registerOauthRoutes(r, api)
	})

	router.Group(func(r chi.Router) {
		api.UseMiddleware(m.AuthMiddleware(api))
		a.registerHelloRoutes(r, api)
		a.registerFarmRoutes(r, api)
		a.registerUserRoutes(r, api)
		a.registerInventoryRoutes(r, api)
	})

	return router
}
