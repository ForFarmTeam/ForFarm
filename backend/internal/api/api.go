package api

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/forfarm/backend/internal/domain"
	m "github.com/forfarm/backend/internal/middlewares"
	"github.com/forfarm/backend/internal/repository"
)

type api struct {
	logger     *slog.Logger
	httpClient *http.Client

	userRepo domain.UserRepository
	cropRepo domain.CroplandRepository
}

func NewAPI(ctx context.Context, logger *slog.Logger, pool *pgxpool.Pool) *api {

	client := &http.Client{}

	// Initialize repositories for users and croplands
	userRepository := repository.NewPostgresUser(pool)
	croplandRepository := repository.NewPostgresCropland(pool)

	return &api{
		logger:     logger,
		httpClient: client,

		userRepo: userRepository,
		cropRepo: croplandRepository,
	}
}

func (a *api) Server(port int) *http.Server {
	return &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: a.Routes()}
}

func (a *api) Routes() *chi.Mux {
	router := chi.NewRouter()
	router.Use(middleware.Logger)

	config := huma.DefaultConfig("ForFarm Public API", "v1.0.0")
	api := humachi.New(router, config)

	// Register Authentication Routes
	router.Group(func(r chi.Router) {
		a.registerAuthRoutes(r, api)
		a.registerCropRoutes(r, api)
	})

	// Register Cropland Routes, including Auth Middleware if required
	router.Group(func(r chi.Router) {
		// Apply Authentication middleware to the Cropland routes
		api.UseMiddleware(m.AuthMiddleware(api))
	})

	return router
}
