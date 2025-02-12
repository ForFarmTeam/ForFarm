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
)

type api struct {
	logger     *slog.Logger
	httpClient *http.Client
}

func NewAPI(ctx context.Context, logger *slog.Logger) *api {

	client := &http.Client{}

	return &api{
		logger:     logger,
		httpClient: client,
	}
}

func (a *api) Server(port int) *http.Server {
	return &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: a.Routes()}
}

func (a *api) Routes() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Logger)

	api := humachi.New(r, huma.DefaultConfig("ForFarm API", "v1.0.0"))
	huma.Get(api, "/helloworld", a.helloWorldHandler)

	// r.Get("/helloworld", a.helloWorldHandler)

	return r
}
