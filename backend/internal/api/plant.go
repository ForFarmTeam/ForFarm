package api

import (
	"context"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/go-chi/chi/v5"
)

func (a *api) registerPlantRoutes(_ chi.Router, api huma.API) {
	tags := []string{"plant"}
	prefix := "/plant"

	huma.Register(api, huma.Operation{
		OperationID: "getAllPlant",
		Method:      http.MethodGet,
		Path:        prefix,
		Tags:        tags,
	}, a.getAllPlantHandler)
}

type GetAllPlantsOutput struct {
	Body struct {
		Plants []domain.Plant `json:"plants"`
	}
}

func (a *api) getAllPlantHandler(ctx context.Context, input *struct{}) (*GetAllPlantsOutput, error) {
	resp := &GetAllPlantsOutput{}
	plants, err := a.plantRepo.GetAll(ctx)
	if err != nil {
		a.logger.Error("Failed to get all plants", "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve plants")
	}

	if plants == nil {
		plants = []domain.Plant{}
	}

	resp.Body.Plants = plants

	return resp, nil
}
