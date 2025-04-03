package api

import (
	"context"
	"errors"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (a *api) registerAnalyticsRoutes(_ chi.Router, api huma.API) {
	tags := []string{"analytics"}
	prefix := "/analytics"

	huma.Register(api, huma.Operation{
		OperationID: "getFarmAnalytics",
		Method:      http.MethodGet,
		Path:        prefix + "/farm/{farmId}", // Changed path param name
		Tags:        tags,
		Summary:     "Get aggregated analytics data for a specific farm",
		Description: "Retrieves various analytics metrics for a farm, requiring user ownership.",
	}, a.getFarmAnalyticsHandler)

	// New endpoint for Crop Analytics
	huma.Register(api, huma.Operation{
		OperationID: "getCropAnalytics",
		Method:      http.MethodGet,
		Path:        prefix + "/crop/{cropId}", // Changed path param name
		Tags:        tags,
		Summary:     "Get analytics data for a specific crop",
		Description: "Retrieves analytics metrics for a specific crop/cropland, requiring user ownership of the parent farm.",
	}, a.getCropAnalyticsHandler)
}

type GetFarmAnalyticsInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farmId" required:"true" doc:"UUID of the farm to get analytics for" example:"a1b2c3d4-e5f6-7890-1234-567890abcdef"` // Changed path param name
}

type GetFarmAnalyticsOutput struct {
	Body domain.FarmAnalytics `json:"body"`
}

// New Input Type for Crop Analytics
type GetCropAnalyticsInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	CropID string `path:"cropId" required:"true" doc:"UUID of the crop/cropland to get analytics for" example:"b2c3d4e5-f6a7-8901-2345-67890abcdef1"` // Changed path param name
}

// New Output Type for Crop Analytics
type GetCropAnalyticsOutput struct {
	Body domain.CropAnalytics `json:"body"`
}

func (a *api) getFarmAnalyticsHandler(ctx context.Context, input *GetFarmAnalyticsInput) (*GetFarmAnalyticsOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed: " + err.Error())
	}

	if _, err := uuid.Parse(input.FarmID); err != nil {
		return nil, huma.Error400BadRequest("Invalid Farm ID format.")
	}

	analyticsData, err := a.analyticsRepo.GetFarmAnalytics(ctx, input.FarmID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			a.logger.Info("Analytics data not found for farm", "farm_id", input.FarmID)
			return nil, huma.Error404NotFound("Analytics data not found for this farm.")
		}
		a.logger.Error("Failed to retrieve farm analytics", "farm_id", input.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve analytics data.")
	}

	// Authorization Check: User must own the farm
	if analyticsData.OwnerID != userID {
		a.logger.Warn("User attempted to access analytics for farm they do not own", "user_id", userID, "farm_id", input.FarmID, "owner_id", analyticsData.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to view analytics for this farm.")
	}

	resp := &GetFarmAnalyticsOutput{
		Body: *analyticsData,
	}
	return resp, nil
}

// New Handler for Crop Analytics
func (a *api) getCropAnalyticsHandler(ctx context.Context, input *GetCropAnalyticsInput) (*GetCropAnalyticsOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed: " + err.Error())
	}

	if _, err := uuid.Parse(input.CropID); err != nil {
		return nil, huma.Error400BadRequest("Invalid Crop ID format.")
	}

	// Fetch Crop Analytics Data
	cropAnalytics, err := a.analyticsRepo.GetCropAnalytics(ctx, input.CropID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			a.logger.Info("Crop analytics data not found", "crop_id", input.CropID)
			return nil, huma.Error404NotFound("Crop analytics data not found.")
		}
		a.logger.Error("Failed to retrieve crop analytics", "crop_id", input.CropID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve crop analytics data.")
	}

	// Authorization Check: Verify user owns the farm this crop belongs to
	farm, err := a.farmRepo.GetByID(ctx, cropAnalytics.FarmID)
	if err != nil {
		// This case is less likely if cropAnalytics was found, but handle defensively
		if errors.Is(err, domain.ErrNotFound) {
			a.logger.Error("Farm associated with crop not found", "farm_id", cropAnalytics.FarmID, "crop_id", input.CropID)
			return nil, huma.Error404NotFound("Associated farm not found.")
		}
		a.logger.Error("Failed to retrieve farm for authorization check", "farm_id", cropAnalytics.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to verify ownership.")
	}

	if farm.OwnerID != userID {
		a.logger.Warn("User attempted to access analytics for crop on farm they do not own", "user_id", userID, "crop_id", input.CropID, "farm_id", cropAnalytics.FarmID)
		return nil, huma.Error403Forbidden("You are not authorized to view analytics for this crop.")
	}

	// Return the fetched data
	resp := &GetCropAnalyticsOutput{
		Body: *cropAnalytics,
	}
	return resp, nil
}
