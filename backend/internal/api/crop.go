package api

import (
	"context"
	"errors"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/gofrs/uuid"
)

// Register the crop routes
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

// Response structure for all croplands
type GetCroplandsOutput struct {
	Body struct {
		Croplands []domain.Cropland `json:"croplands"`
	} `json:"body"`
}

// Response structure for single cropland by ID
type GetCroplandByIDOutput struct {
	Body struct {
		Cropland domain.Cropland `json:"cropland"`
	} `json:"body"`
}

// Request structure for creating or updating a cropland
type CreateOrUpdateCroplandInput struct {
	Body struct {
		UUID        string  `json:"uuid,omitempty"` // Optional for create, required for update
		Name        string  `json:"name"`
		Status      string  `json:"status"`
		Priority    int     `json:"priority"`
		LandSize    float64 `json:"land_size"`
		GrowthStage string  `json:"growth_stage"`
		PlantID     string  `json:"plant_id"`
		FarmID      string  `json:"farm_id"`
	} `json:"body"`
}

// Response structure for creating or updating a cropland
type CreateOrUpdateCroplandOutput struct {
	Body struct {
		Cropland domain.Cropland `json:"cropland"`
	} `json:"body"`
}

// GetAllCroplands handles GET /crop endpoint
func (a *api) getAllCroplandsHandler(ctx context.Context, input *struct{}) (*GetCroplandsOutput, error) {
	resp := &GetCroplandsOutput{}

	// Fetch all croplands without filtering by farmID
	croplands, err := a.cropRepo.GetAll(ctx) // Use the GetAll method
	if err != nil {
		return nil, err
	}

	resp.Body.Croplands = croplands
	return resp, nil
}

// GetCroplandByID handles GET /crop/{uuid} endpoint
func (a *api) getCroplandByIDHandler(ctx context.Context, input *struct {
	UUID string `path:"uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
}) (*GetCroplandByIDOutput, error) {
	resp := &GetCroplandByIDOutput{}

	// Validate the UUID format
	if input.UUID == "" {
		return nil, huma.Error400BadRequest("UUID parameter is required")
	}

	// Check if the UUID is in a valid format
	_, err := uuid.FromString(input.UUID)
	if err != nil {
		return nil, huma.Error400BadRequest("invalid UUID format")
	}

	// Fetch cropland by ID
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

// GetAllCroplandsByFarmID handles GET /crop/farm/{farm_id} endpoint
func (a *api) getAllCroplandsByFarmIDHandler(ctx context.Context, input *struct {
	FarmID string `path:"farm_id" example:"550e8400-e29b-41d4-a716-446655440000"`
}) (*GetCroplandsOutput, error) {
	resp := &GetCroplandsOutput{}

	// Validate the FarmID format
	if input.FarmID == "" {
		return nil, huma.Error400BadRequest("FarmID parameter is required")
	}

	// Check if the FarmID is in a valid format
	_, err := uuid.FromString(input.FarmID)
	if err != nil {
		return nil, huma.Error400BadRequest("invalid FarmID format")
	}

	// Fetch croplands by FarmID
	croplands, err := a.cropRepo.GetByFarmID(ctx, input.FarmID)
	if err != nil {
		return nil, err
	}

	resp.Body.Croplands = croplands
	return resp, nil
}

// CreateOrUpdateCropland handles POST /crop endpoint
func (a *api) createOrUpdateCroplandHandler(ctx context.Context, input *CreateOrUpdateCroplandInput) (*CreateOrUpdateCroplandOutput, error) {
	resp := &CreateOrUpdateCroplandOutput{}

	// Validate required fields
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

	// Validate UUID if provided
	if input.Body.UUID != "" {
		_, err := uuid.FromString(input.Body.UUID)
		if err != nil {
			return nil, huma.Error400BadRequest("invalid UUID format")
		}
	}

	// Map input to domain.Cropland
	cropland := &domain.Cropland{
		UUID:        input.Body.UUID,
		Name:        input.Body.Name,
		Status:      input.Body.Status,
		Priority:    input.Body.Priority,
		LandSize:    input.Body.LandSize,
		GrowthStage: input.Body.GrowthStage,
		PlantID:     input.Body.PlantID,
		FarmID:      input.Body.FarmID,
	}

	// Create or update the cropland
	err := a.cropRepo.CreateOrUpdate(ctx, cropland)
	if err != nil {
		return nil, err
	}

	// Return the created/updated cropland
	resp.Body.Cropland = *cropland
	return resp, nil
}
