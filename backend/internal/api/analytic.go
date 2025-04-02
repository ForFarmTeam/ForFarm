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
		Path:        prefix + "/farm/{farm_id}",
		Tags:        tags,
		Summary:     "Get aggregated analytics data for a specific farm",
		Description: "Retrieves various analytics metrics for a farm, requiring user ownership.",
	}, a.getFarmAnalyticsHandler)
}

type GetFarmAnalyticsInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farm_id" required:"true" doc:"UUID of the farm to get analytics for" example:"a1b2c3d4-e5f6-7890-1234-567890abcdef"`
}

type GetFarmAnalyticsOutput struct {
	Body domain.FarmAnalytics `json:"body"`
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

	if analyticsData.OwnerID != userID {
		a.logger.Warn("User attempted to access analytics for farm they do not own", "user_id", userID, "farm_id", input.FarmID, "owner_id", analyticsData.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to view analytics for this farm.")
	}

	resp := &GetFarmAnalyticsOutput{
		Body: *analyticsData,
	}
	return resp, nil
}
