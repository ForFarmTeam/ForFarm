package api

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/go-chi/chi/v5"
)

type HealthCheckOutput struct {
	Body struct {
		Status     string `json:"status"`
		CacheCheck string `json:"cache_check"`
	}
}

func (a *api) registerHealthRoutes(_ chi.Router, api huma.API) {
	huma.Register(api, huma.Operation{
		OperationID: "healthCheck",
		Method:      http.MethodGet,
		Path:        "/health",
		Tags:        []string{"_ops"},
		Summary:     "Check API Health",
		Description: "Performs basic health checks and returns the service status.",
	}, a.healthCheckHandler)
}

func (a *api) healthCheckHandler(ctx context.Context, input *struct{}) (*HealthCheckOutput, error) {
	resp := &HealthCheckOutput{}
	cacheOK := true

	testKey := "healthcheck_test"
	testValue := "ok"
	a.cache.Set(testKey, testValue, 5*time.Second)
	_, found := a.cache.Get(testKey)
	if !found {
		a.logger.WarnContext(ctx, "Cache health check failed (set/get)", "key", testKey)
		resp.Body.CacheCheck = "unhealthy"
		cacheOK = false
	} else {
		resp.Body.CacheCheck = "ok"
		a.cache.Delete(testKey)
	}

	if cacheOK {
		resp.Body.Status = "ok"
		return resp, nil
	}

	resp.Body.Status = "unhealthy"
	return nil, huma.Error503ServiceUnavailable("Service is unhealthy", fmt.Errorf("dependencies failed: cache=%t", cacheOK))
}
