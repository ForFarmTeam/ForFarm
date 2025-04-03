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
		Path:        prefix + "/farm/{farmId}",
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
	}
}

type GetCroplandByIDOutput struct {
	Body struct {
		Cropland domain.Cropland `json:"cropland"`
	}
}

type CreateOrUpdateCroplandInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	Body   struct {
		UUID        string          `json:"uuid,omitempty"`
		Name        string          `json:"name"`
		Status      string          `json:"status"`
		Priority    int             `json:"priority"`
		LandSize    float64         `json:"landSize"`
		GrowthStage string          `json:"growthStage"`
		PlantID     string          `json:"plantId"`
		FarmID      string          `json:"farmId"`
		GeoFeature  json.RawMessage `json:"geoFeature,omitempty"`
	}
}

type CreateOrUpdateCroplandOutput struct {
	Body struct {
		Cropland domain.Cropland `json:"cropland"`
	}
}

// --- Handlers ---

func (a *api) getAllCroplandsHandler(ctx context.Context, input *struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
}) (*GetCroplandsOutput, error) {
	// Note: This currently fetches ALL croplands. Might need owner filtering later.
	// For now, ensure authentication happens.
	_, err := a.getUserIDFromHeader(input.Header) // Verify token
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
	userID, err := a.getUserIDFromHeader(input.Header) // Verify token and get user ID
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	resp := &GetCroplandByIDOutput{}

	if input.UUID == "" {
		return nil, huma.Error400BadRequest("UUID parameter is required")
	}

	_, err = uuid.FromString(input.UUID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid UUID format")
	}

	cropland, err := a.cropRepo.GetByID(ctx, input.UUID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Warn("Cropland not found", "croplandId", input.UUID, "requestingUserId", userID)
			return nil, huma.Error404NotFound("Cropland not found")
		}
		a.logger.Error("Failed to get cropland by ID", "croplandId", input.UUID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve cropland")
	}

	// Authorization check: User must own the farm this cropland belongs to
	farm, err := a.farmRepo.GetByID(ctx, cropland.FarmID) // Fetch the farm
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Error("Farm associated with cropland not found", "farmId", cropland.FarmID, "croplandId", input.UUID)
			// This indicates a data integrity issue if the cropland exists but farm doesn't
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
		return nil, huma.Error400BadRequest("farm_id parameter is required")
	}

	farmUUID, err := uuid.FromString(input.FarmID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid farmId format")
	}

	// Authorization check: User must own the farm they are requesting crops for
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

func (a *api) createOrUpdateCroplandHandler(ctx context.Context, input *CreateOrUpdateCroplandInput) (*CreateOrUpdateCroplandOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	resp := &CreateOrUpdateCroplandOutput{}

	// --- Input Validation ---
	if input.Body.Name == "" {
		return nil, huma.Error400BadRequest("name is required")
	}
	if input.Body.Status == "" {
		return nil, huma.Error400BadRequest("status is required")
	}
	if input.Body.GrowthStage == "" {
		return nil, huma.Error400BadRequest("growthStage is required")
	}
	if input.Body.PlantID == "" {
		return nil, huma.Error400BadRequest("plantId is required")
	}
	if input.Body.FarmID == "" {
		return nil, huma.Error400BadRequest("farmId is required")
	}

	// Validate UUID formats
	if input.Body.UUID != "" {
		if _, err := uuid.FromString(input.Body.UUID); err != nil {
			return nil, huma.Error400BadRequest("invalid cropland UUID format")
		}
	}
	if _, err := uuid.FromString(input.Body.PlantID); err != nil {
		return nil, huma.Error400BadRequest("invalid plantId UUID format")
	}
	farmUUID, err := uuid.FromString(input.Body.FarmID)
	if err != nil {
		return nil, huma.Error400BadRequest("invalid farm_id UUID format")
	}

	// Validate JSON format if GeoFeature is provided
	if input.Body.GeoFeature != nil && !json.Valid(input.Body.GeoFeature) {
		return nil, huma.Error400BadRequest("invalid JSON format for geoFeature")
	}

	// --- Authorization Check ---
	// User must own the farm they are adding/updating a crop for
	farm, err := a.farmRepo.GetByID(ctx, farmUUID.String())
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Warn("Attempt to create/update crop for non-existent farm", "farmId", input.Body.FarmID, "requestingUserId", userID)
			return nil, huma.Error404NotFound("Target farm not found")
		}
		a.logger.Error("Failed to fetch farm for create/update cropland authorization", "farmId", input.Body.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to verify ownership")
	}
	if farm.OwnerID != userID {
		a.logger.Warn("Unauthorized attempt to create/update crop on farm", "farmId", input.Body.FarmID, "requestingUserId", userID, "farmOwnerId", farm.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to modify crops on this farm")
	}

	// If updating, ensure the user also owns the existing cropland (redundant if farm check passes, but good practice)
	if input.Body.UUID != "" {
		existingCrop, err := a.cropRepo.GetByID(ctx, input.Body.UUID)
		if err != nil && !errors.Is(err, domain.ErrNotFound) && !errors.Is(err, sql.ErrNoRows) { // Ignore not found for creation
			a.logger.Error("Failed to get existing cropland for update authorization check", "croplandId", input.Body.UUID, "error", err)
			return nil, huma.Error500InternalServerError("Failed to verify existing cropland")
		}
		// If cropland exists and its FarmID doesn't match the input/authorized FarmID, deny.
		if err == nil && existingCrop.FarmID != farmUUID.String() {
			a.logger.Warn("Attempt to update cropland belonging to a different farm", "croplandId", input.Body.UUID, "inputFarmId", input.Body.FarmID, "actualFarmId", existingCrop.FarmID)
			return nil, huma.Error403Forbidden("Cropland does not belong to the specified farm")
		}
	}

	// --- Prepare and Save Cropland ---
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

	// Use the repository's CreateOrUpdate which handles assigning UUID if needed
	err = a.cropRepo.CreateOrUpdate(ctx, cropland)
	if err != nil {
		a.logger.Error("Failed to save cropland to database", "farm_id", input.Body.FarmID, "plantId", input.Body.PlantID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to save cropland")
	}

	a.logger.Info("Cropland created/updated successfully", "croplandId", cropland.UUID, "farmId", cropland.FarmID)

	resp.Body.Cropland = *cropland
	return resp, nil
}
