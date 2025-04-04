package api

import (
	"context"
	"database/sql"
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

	huma.Register(api, huma.Operation{
		OperationID: "getAllCroplands",
		Method:      http.MethodGet,
		Path:        prefix,
		Tags:        tags,
	}, a.getAllCroplandsHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getCroplandByID",
		Method:      http.MethodGet,
		Path:        prefix + "/{uuid}",
		Tags:        tags,
	}, a.getCroplandByIDHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getAllCroplandsByFarmID",
		Method:      http.MethodGet,
		Path:        prefix + "/farm/{farmId}",
		Tags:        tags,
	}, a.getAllCroplandsByFarmIDHandler)

	huma.Register(api, huma.Operation{
		OperationID: "createCropland",
		Method:      http.MethodPost,
		Path:        prefix,
		Tags:        tags,
	}, a.createCroplandHandler)

	huma.Register(api, huma.Operation{
		OperationID: "updateCropland",
		Method:      http.MethodPut,
		Path:        prefix + "/{uuid}",
		Tags:        tags,
	}, a.updateCroplandHandler)
}

// --- Common Output Structs ---

type GetCroplandsOutput struct {
	Body struct {
		Croplands []domain.Cropland `json:"croplands"`
	}
}

type GetCroplandByIDOutput struct {
	Body struct {
		Cropland domain.Cropland `json:"cropland"`
	}
}

// --- Create Structs ---

type CreateCroplandInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	Body   struct {
		Name        string          `json:"name" required:"true"`
		Status      string          `json:"status" required:"true"`
		Priority    int             `json:"priority"`
		LandSize    float64         `json:"landSize"`
		GrowthStage string          `json:"growthStage" required:"true"`
		PlantID     string          `json:"plantId" required:"true" example:"a1b2c3d4-e5f6-7890-1234-567890abcdef"`
		FarmID      string          `json:"farmId" required:"true" example:"b2c3d4e5-f6a7-8901-2345-67890abcdef0"`
		GeoFeature  json.RawMessage `json:"geoFeature,omitempty"`
	}
}

type CreateCroplandOutput struct {
	Body struct {
		Cropland domain.Cropland `json:"cropland"`
	}
}

// --- Update Structs ---

type UpdateCroplandInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	UUID   string `path:"uuid" required:"true" example:"c3d4e5f6-a7b8-9012-3456-7890abcdef01"`
	Body   struct {
		Name        string          `json:"name" required:"true"`
		Status      string          `json:"status" required:"true"`
		Priority    int             `json:"priority"`
		LandSize    float64         `json:"landSize"`
		GrowthStage string          `json:"growthStage" required:"true"`
		PlantID     string          `json:"plantId" required:"true" example:"a1b2c3d4-e5f6-7890-1234-567890abcdef"`
		GeoFeature  json.RawMessage `json:"geoFeature,omitempty"`
	}
}

type UpdateCroplandOutput struct {
	Body struct {
		Cropland domain.Cropland `json:"cropland"`
	}
}

// --- Handlers ---

func (a *api) getAllCroplandsHandler(ctx context.Context, input *struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
}) (*GetCroplandsOutput, error) {
	// Note: This currently fetches ALL croplands. Might need owner filtering later.
	_, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	resp := &GetCroplandsOutput{}

	croplands, err := a.cropRepo.GetAll(ctx)
	if err != nil {
		a.logger.Error("Failed to get all croplands", "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve croplands")
	}

	resp.Body.Croplands = croplands
	return resp, nil
}

func (a *api) getCroplandByIDHandler(ctx context.Context, input *struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	UUID   string `path:"uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
}) (*GetCroplandByIDOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	resp := &GetCroplandByIDOutput{}

	if input.UUID == "" {
		return nil, huma.Error400BadRequest("UUID path parameter is required")
	}

	croplandUUID, err := uuid.FromString(input.UUID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid UUID format")
	}

	cropland, err := a.cropRepo.GetByID(ctx, croplandUUID.String())
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Warn("Cropland not found", "croplandId", input.UUID, "requestingUserId", userID)
			return nil, huma.Error404NotFound("Cropland not found")
		}
		a.logger.Error("Failed to get cropland by ID", "croplandId", input.UUID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve cropland")
	}

	farm, err := a.farmRepo.GetByID(ctx, cropland.FarmID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Error("Farm associated with cropland not found", "farmId", cropland.FarmID, "croplandId", input.UUID)
			return nil, huma.Error404NotFound("Associated farm not found for cropland")
		}
		a.logger.Error("Failed to fetch farm for cropland authorization", "farmId", cropland.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to verify ownership")
	}

	if farm.OwnerID != userID {
		a.logger.Warn("Unauthorized attempt to access cropland", "croplandId", input.UUID, "requestingUserId", userID, "farmOwnerId", farm.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to view this cropland")
	}

	resp.Body.Cropland = cropland
	return resp, nil
}

func (a *api) getAllCroplandsByFarmIDHandler(ctx context.Context, input *struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farmId" example:"550e8400-e29b-41d4-a716-446655440000"`
}) (*GetCroplandsOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	resp := &GetCroplandsOutput{}

	if input.FarmID == "" {
		return nil, huma.Error400BadRequest("farmId path parameter is required")
	}

	farmUUID, err := uuid.FromString(input.FarmID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid farmId format")
	}

	farm, err := a.farmRepo.GetByID(ctx, farmUUID.String())
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Warn("Attempt to get crops for non-existent farm", "farmId", input.FarmID, "requestingUserId", userID)
			return nil, huma.Error404NotFound("Farm not found")
		}
		a.logger.Error("Failed to fetch farm for cropland list authorization", "farmId", input.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to verify ownership")
	}
	if farm.OwnerID != userID {
		a.logger.Warn("Unauthorized attempt to list crops for farm", "farmId", input.FarmID, "requestingUserId", userID, "farmOwnerId", farm.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to view crops for this farm")
	}

	croplands, err := a.cropRepo.GetByFarmID(ctx, input.FarmID)
	if err != nil {
		a.logger.Error("Failed to get croplands by farm ID", "farmId", input.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve croplands for farm")
	}

	if croplands == nil {
		croplands = []domain.Cropland{}
	}

	resp.Body.Croplands = croplands
	return resp, nil
}

func (a *api) createCroplandHandler(ctx context.Context, input *CreateCroplandInput) (*CreateCroplandOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	resp := &CreateCroplandOutput{}

	if _, err := uuid.FromString(input.Body.PlantID); err != nil {
		return nil, huma.Error400BadRequest("invalid plantId UUID format")
	}
	farmUUID, err := uuid.FromString(input.Body.FarmID)
	if err != nil {
		return nil, huma.Error400BadRequest("invalid farmId UUID format")
	}

	if input.Body.GeoFeature != nil && !json.Valid(input.Body.GeoFeature) {
		return nil, huma.Error400BadRequest("invalid JSON format for geoFeature")
	}

	farm, err := a.farmRepo.GetByID(ctx, farmUUID.String())
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Warn("Attempt to create crop for non-existent farm", "farmId", input.Body.FarmID, "requestingUserId", userID)
			return nil, huma.Error404NotFound("Target farm not found")
		}
		a.logger.Error("Failed to fetch farm for create cropland authorization", "farmId", input.Body.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to verify ownership")
	}
	if farm.OwnerID != userID {
		a.logger.Warn("Unauthorized attempt to create crop on farm", "farmId", input.Body.FarmID, "requestingUserId", userID, "farmOwnerId", farm.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to add crops to this farm")
	}

	cropland := &domain.Cropland{
		Name:        input.Body.Name,
		Status:      input.Body.Status,
		Priority:    input.Body.Priority,
		LandSize:    input.Body.LandSize,
		GrowthStage: input.Body.GrowthStage,
		PlantID:     input.Body.PlantID,
		FarmID:      input.Body.FarmID,
		GeoFeature:  input.Body.GeoFeature,
	}

	err = a.cropRepo.CreateOrUpdate(ctx, cropland)
	if err != nil {
		a.logger.Error("Failed to create cropland in database", "farmId", input.Body.FarmID, "plantId", input.Body.PlantID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to save cropland")
	}

	a.logger.Info("Cropland created successfully", "croplandId", cropland.UUID, "farmId", cropland.FarmID)

	resp.Body.Cropland = *cropland
	return resp, nil
}

func (a *api) updateCroplandHandler(ctx context.Context, input *UpdateCroplandInput) (*UpdateCroplandOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	resp := &UpdateCroplandOutput{}

	croplandUUID, err := uuid.FromString(input.UUID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid cropland UUID format in path")
	}

	if _, err := uuid.FromString(input.Body.PlantID); err != nil {
		return nil, huma.Error400BadRequest("invalid plantId UUID format in body")
	}

	if input.Body.GeoFeature != nil && !json.Valid(input.Body.GeoFeature) {
		return nil, huma.Error400BadRequest("invalid JSON format for geoFeature")
	}

	existingCrop, err := a.cropRepo.GetByID(ctx, croplandUUID.String())
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Warn("Attempt to update non-existent cropland", "croplandId", input.UUID, "requestingUserId", userID)
			return nil, huma.Error404NotFound("Cropland not found")
		}
		a.logger.Error("Failed to get existing cropland for update", "croplandId", input.UUID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve cropland for update")
	}

	farm, err := a.farmRepo.GetByID(ctx, existingCrop.FarmID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Error("Farm associated with existing cropland not found during update", "farmId", existingCrop.FarmID, "croplandId", input.UUID)
			return nil, huma.Error500InternalServerError("Associated farm data inconsistent")
		}
		a.logger.Error("Failed to fetch farm for update cropland authorization", "farmId", existingCrop.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to verify ownership for update")
	}
	if farm.OwnerID != userID {
		a.logger.Warn("Unauthorized attempt to update crop on farm", "croplandId", input.UUID, "farmId", existingCrop.FarmID, "requestingUserId", userID, "farmOwnerId", farm.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to modify this cropland")
	}

	updatedCropland := &domain.Cropland{
		UUID:        existingCrop.UUID,
		FarmID:      existingCrop.FarmID,
		Name:        input.Body.Name,
		Status:      input.Body.Status,
		Priority:    input.Body.Priority,
		LandSize:    input.Body.LandSize,
		GrowthStage: input.Body.GrowthStage,
		PlantID:     input.Body.PlantID,
		GeoFeature:  input.Body.GeoFeature,
		CreatedAt:   existingCrop.CreatedAt,
	}

	err = a.cropRepo.CreateOrUpdate(ctx, updatedCropland)
	if err != nil {
		a.logger.Error("Failed to update cropland in database", "croplandId", updatedCropland.UUID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to update cropland")
	}

	a.logger.Info("Cropland updated successfully", "croplandId", updatedCropland.UUID, "farmId", updatedCropland.FarmID)

	resp.Body.Cropland = *updatedCropland
	return resp, nil
}
