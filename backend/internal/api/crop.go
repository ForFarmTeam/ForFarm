package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/gofrs/uuid"
)

func (a *api) registerCropRoutes(_ chi.Router, api huma.API) {
	tags := []string{"crop"}

	prefix := "/crop"

	// Register GET /crop
	huma.Register(api, huma.Operation{
		OperationID: "getAllCroplands",
		Method:      http.MethodGet,
		Path:        prefix,
		Tags:        tags,
	}, a.getAllCroplandsHandler)

	// Register GET /crop/{uuid}
	huma.Register(api, huma.Operation{
		OperationID: "getCroplandByID",
		Method:      http.MethodGet,
		Path:        prefix + "/{uuid}",
		Tags:        tags,
	}, a.getCroplandByIDHandler)

	// Register GET /crop/farm/{farm_id}
	huma.Register(api, huma.Operation{
		OperationID: "getAllCroplandsByFarmID",
		Method:      http.MethodGet,
		Path:        prefix + "/farm/{farm_id}",
		Tags:        tags,
	}, a.getAllCroplandsByFarmIDHandler)

	// Register POST /crop (Create or Update)
	huma.Register(api, huma.Operation{
		OperationID: "createOrUpdateCropland",
		Method:      http.MethodPost,
		Path:        prefix,
		Tags:        tags,
	}, a.createOrUpdateCroplandHandler)
}

type GetCroplandsOutput struct {
	Body struct {
		Croplands []domain.Cropland `json:"croplands"`
	} `json:"body"`
}

type GetCroplandByIDOutput struct {
	Body struct {
		Cropland domain.Cropland `json:"cropland"`
	} `json:"body"`
}

type CreateOrUpdateCroplandInput struct {
	Body struct {
		UUID        string          `json:"UUID,omitempty"`
		Name        string          `json:"Name"`
		Status      string          `json:"Status"`
		Priority    int             `json:"Priority"`
		LandSize    float64         `json:"LandSize"`
		GrowthStage string          `json:"GrowthStage"`
		PlantID     string          `json:"PlantID"`
		FarmID      string          `json:"FarmID"`
		GeoFeature  json.RawMessage `json:"GeoFeature,omitempty" doc:"GeoJSON-like feature object (marker, polygon, etc.)" example:"{\"type\":\"marker\",\"position\":{\"lat\":13.84,\"lng\":100.48}}"`
	} `json:"body"`
}

type CreateOrUpdateCroplandOutput struct {
	Body struct {
		Cropland domain.Cropland `json:"cropland"`
	} `json:"body"`
}

func (a *api) getAllCroplandsHandler(ctx context.Context, input *struct{}) (*GetCroplandsOutput, error) {
	resp := &GetCroplandsOutput{}

	croplands, err := a.cropRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	resp.Body.Croplands = croplands
	return resp, nil
}

func (a *api) getCroplandByIDHandler(ctx context.Context, input *struct {
	UUID string `path:"uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
}) (*GetCroplandByIDOutput, error) {
	resp := &GetCroplandByIDOutput{}

	if input.UUID == "" {
		return nil, huma.Error400BadRequest("UUID parameter is required")
	}

	_, err := uuid.FromString(input.UUID)
	if err != nil {
		return nil, huma.Error400BadRequest("invalid UUID format")
	}

	cropland, err := a.cropRepo.GetByID(ctx, input.UUID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, huma.Error404NotFound("cropland not found")
		}
		return nil, err
	}

	resp.Body.Cropland = cropland
	return resp, nil
}

func (a *api) getAllCroplandsByFarmIDHandler(ctx context.Context, input *struct {
	FarmID string `path:"farm_id" example:"550e8400-e29b-41d4-a716-446655440000"`
}) (*GetCroplandsOutput, error) {
	resp := &GetCroplandsOutput{}

	if input.FarmID == "" {
		return nil, huma.Error400BadRequest("FarmID parameter is required")
	}

	_, err := uuid.FromString(input.FarmID)
	if err != nil {
		return nil, huma.Error400BadRequest("invalid FarmID format")
	}

	croplands, err := a.cropRepo.GetByFarmID(ctx, input.FarmID)
	if err != nil {
		return nil, err
	}

	resp.Body.Croplands = croplands
	return resp, nil
}

func (a *api) createOrUpdateCroplandHandler(ctx context.Context, input *CreateOrUpdateCroplandInput) (*CreateOrUpdateCroplandOutput, error) {
	resp := &CreateOrUpdateCroplandOutput{}

	if input.Body.Name == "" {
		return nil, huma.Error400BadRequest("name is required")
	}
	if input.Body.Status == "" {
		return nil, huma.Error400BadRequest("status is required")
	}
	if input.Body.GrowthStage == "" {
		return nil, huma.Error400BadRequest("growth_stage is required")
	}
	if input.Body.PlantID == "" {
		return nil, huma.Error400BadRequest("plant_id is required")
	}
	if input.Body.FarmID == "" {
		return nil, huma.Error400BadRequest("farm_id is required")
	}

	if input.Body.UUID != "" {
		if _, err := uuid.FromString(input.Body.UUID); err != nil {
			return nil, huma.Error400BadRequest("invalid cropland UUID format")
		}
	}
	if _, err := uuid.FromString(input.Body.PlantID); err != nil {
		return nil, huma.Error400BadRequest("invalid plant_id UUID format")
	}
	if _, err := uuid.FromString(input.Body.FarmID); err != nil {
		return nil, huma.Error400BadRequest("invalid farm_id UUID format")
	}

	if input.Body.GeoFeature != nil && !json.Valid(input.Body.GeoFeature) {
		return nil, huma.Error400BadRequest("invalid JSON format for geo_feature")
	}

	cropland := &domain.Cropland{
		UUID:        input.Body.UUID,
		Name:        input.Body.Name,
		Status:      input.Body.Status,
		Priority:    input.Body.Priority,
		LandSize:    input.Body.LandSize,
		GrowthStage: input.Body.GrowthStage,
		PlantID:     input.Body.PlantID,
		FarmID:      input.Body.FarmID,
		GeoFeature:  input.Body.GeoFeature,
	}

	err := a.cropRepo.CreateOrUpdate(ctx, cropland)
	if err != nil {
		return nil, huma.Error500InternalServerError("failed to save cropland")
	}

	resp.Body.Cropland = *cropland
	return resp, nil
}
