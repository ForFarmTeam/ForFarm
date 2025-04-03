package api

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/go-chi/chi/v5"
)

// registerFarmRoutes defines endpoints for farm operations.
func (a *api) registerFarmRoutes(_ chi.Router, api huma.API) {
	tags := []string{"farm"}
	prefix := "/farms"

	huma.Register(api, huma.Operation{
		OperationID: "getAllFarms",
		Method:      http.MethodGet,
		Path:        prefix,
		Tags:        tags,
	}, a.getAllFarmsHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getFarmByID",
		Method:      http.MethodGet,
		Path:        prefix + "/{farmId}",
		Tags:        tags,
	}, a.getFarmByIDHandler)

	huma.Register(api, huma.Operation{
		OperationID: "createFarm",
		Method:      http.MethodPost,
		Path:        prefix,
		Tags:        tags,
	}, a.createFarmHandler)

	huma.Register(api, huma.Operation{
		OperationID: "updateFarm",
		Method:      http.MethodPut,
		Path:        prefix + "/{farmId}",
		Tags:        tags,
	}, a.updateFarmHandler)

	huma.Register(api, huma.Operation{
		OperationID: "deleteFarm",
		Method:      http.MethodDelete,
		Path:        prefix + "/{farmId}",
		Tags:        tags,
	}, a.deleteFarmHandler)
}

//
// Input and Output types
//

type CreateFarmInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	Body   struct {
		Name      string  `json:"name" required:"true"`
		Lat       float64 `json:"lat" required:"true"`
		Lon       float64 `json:"lon" required:"true"`
		FarmType  string  `json:"farmType,omitempty"`
		TotalSize string  `json:"totalSize,omitempty"`
	}
}

type CreateFarmOutput struct {
	Body struct {
		UUID string `json:"uuid"`
	}
}

type GetAllFarmsInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
}

type GetAllFarmsOutput struct {
	Body []domain.Farm `json:"farms"`
}

type GetFarmByIDInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farmId" required:"true"`
}

type GetFarmByIDOutput struct {
	Body domain.Farm `json:"farm"`
}

type UpdateFarmInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farmId" required:"true"`
	Body   struct {
		Name      *string  `json:"name,omitempty"`
		Lat       *float64 `json:"lat,omitempty"`
		Lon       *float64 `json:"lon,omitempty"`
		FarmType  *string  `json:"farmType,omitempty"`
		TotalSize *string  `json:"totalSize,omitempty"`
	}
}

type UpdateFarmOutput struct {
	Body domain.Farm `json:"farm"`
}

type DeleteFarmInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farmId" required:"true"`
}

type DeleteFarmOutput struct {
	Body struct {
		Message string `json:"message"`
	}
}

//
// API Handlers
//

func (a *api) createFarmHandler(ctx context.Context, input *CreateFarmInput) (*CreateFarmOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	farm := &domain.Farm{
		Name:      input.Body.Name,
		Lat:       input.Body.Lat,
		Lon:       input.Body.Lon,
		FarmType:  input.Body.FarmType,
		TotalSize: input.Body.TotalSize,
		OwnerID:   userID,
	}

	// Validate the farm object (optional but recommended)
	// if err := farm.Validate(); err != nil {
	// 	return nil, huma.Error422UnprocessableEntity("Validation failed", err)
	// }

	fmt.Println("Creating farm:", farm) // Keep for debugging if needed

	if err := a.farmRepo.CreateOrUpdate(ctx, farm); err != nil {
		a.logger.Error("Failed to create farm in database", "error", err, "ownerId", userID, "farmName", farm.Name)
		return nil, huma.Error500InternalServerError("Failed to create farm")
	}

	a.logger.Info("Farm created successfully", "farmId", farm.UUID, "ownerId", userID)

	return &CreateFarmOutput{
		Body: struct {
			UUID string `json:"uuid"`
		}{UUID: farm.UUID},
	}, nil
}

func (a *api) getAllFarmsHandler(ctx context.Context, input *GetAllFarmsInput) (*GetAllFarmsOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	farms, err := a.farmRepo.GetByOwnerID(ctx, userID)
	if err != nil {
		a.logger.Error("Failed to get farms by owner ID", "ownerId", userID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve farms")
	}

	// Handle case where user has no farms (return empty list, not error)
	if farms == nil {
		farms = []domain.Farm{}
	}

	return &GetAllFarmsOutput{Body: farms}, nil
}

func (a *api) getFarmByIDHandler(ctx context.Context, input *GetFarmByIDInput) (*GetFarmByIDOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	farm, err := a.farmRepo.GetByID(ctx, input.FarmID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) { // Handle pgx ErrNoRows too
			a.logger.Warn("Farm not found", "farmId", input.FarmID, "requestingUserId", userID)
			return nil, huma.Error404NotFound("Farm not found")
		}
		a.logger.Error("Failed to get farm by ID", "farmId", input.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve farm")
	}

	if farm.OwnerID != userID {
		a.logger.Warn("Unauthorized attempt to access farm", "farmId", input.FarmID, "requestingUserId", userID, "ownerId", farm.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to view this farm")
	}

	return &GetFarmByIDOutput{Body: *farm}, nil
}

func (a *api) updateFarmHandler(ctx context.Context, input *UpdateFarmInput) (*UpdateFarmOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	farm, err := a.farmRepo.GetByID(ctx, input.FarmID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Warn("Attempt to update non-existent farm", "farmId", input.FarmID, "requestingUserId", userID)
			return nil, huma.Error404NotFound("Farm not found")
		}
		a.logger.Error("Failed to get farm for update", "farmId", input.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve farm for update")
	}

	if farm.OwnerID != userID {
		a.logger.Warn("Unauthorized attempt to update farm", "farmId", input.FarmID, "requestingUserId", userID, "ownerId", farm.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to update this farm")
	}

	// Apply updates selectively
	updated := false
	if input.Body.Name != nil && *input.Body.Name != "" && *input.Body.Name != farm.Name {
		farm.Name = *input.Body.Name
		updated = true
	}
	if input.Body.Lat != nil && *input.Body.Lat != farm.Lat {
		farm.Lat = *input.Body.Lat
		updated = true
	}
	if input.Body.Lon != nil && *input.Body.Lon != farm.Lon {
		farm.Lon = *input.Body.Lon
		updated = true
	}
	if input.Body.FarmType != nil && *input.Body.FarmType != farm.FarmType {
		farm.FarmType = *input.Body.FarmType
		updated = true
	}
	if input.Body.TotalSize != nil && *input.Body.TotalSize != farm.TotalSize {
		farm.TotalSize = *input.Body.TotalSize
		updated = true
	}

	if !updated {
		a.logger.Info("No changes detected for farm update", "farmId", input.FarmID)
		// Return the existing farm data as no update was needed
		return &UpdateFarmOutput{Body: *farm}, nil
	}

	// Validate updated farm object (optional but recommended)
	// if err := farm.Validate(); err != nil {
	// 	return nil, huma.Error422UnprocessableEntity("Validation failed after update", err)
	// }

	if err = a.farmRepo.CreateOrUpdate(ctx, farm); err != nil {
		a.logger.Error("Failed to update farm in database", "farmId", input.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to update farm")
	}

	a.logger.Info("Farm updated successfully", "farmId", farm.UUID, "ownerId", userID)

	// Fetch the updated farm again to ensure we return the latest state (including UpdatedAt)
	updatedFarm, fetchErr := a.farmRepo.GetByID(ctx, input.FarmID)
	if fetchErr != nil {
		a.logger.Error("Failed to fetch farm after update", "farmId", input.FarmID, "error", fetchErr)
		// Return the potentially stale data from 'farm' as a fallback, but log the error
		return &UpdateFarmOutput{Body: *farm}, nil
	}

	return &UpdateFarmOutput{Body: *updatedFarm}, nil
}

func (a *api) deleteFarmHandler(ctx context.Context, input *DeleteFarmInput) (*DeleteFarmOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	farm, err := a.farmRepo.GetByID(ctx, input.FarmID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
			a.logger.Warn("Attempt to delete non-existent farm", "farmId", input.FarmID, "requestingUserId", userID)
			// Consider returning 204 No Content if delete is idempotent
			return nil, huma.Error404NotFound("Farm not found")
		}
		a.logger.Error("Failed to get farm for deletion", "farmId", input.FarmID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve farm for deletion")
	}

	if farm.OwnerID != userID {
		a.logger.Warn("Unauthorized attempt to delete farm", "farmId", input.FarmID, "requestingUserId", userID, "ownerId", farm.OwnerID)
		return nil, huma.Error403Forbidden("You are not authorized to delete this farm")
	}

	if err := a.farmRepo.Delete(ctx, input.FarmID); err != nil {
		a.logger.Error("Failed to delete farm from database", "farmId", input.FarmID, "error", err)
		// Consider potential FK constraint errors if crops aren't deleted automatically
		return nil, huma.Error500InternalServerError("Failed to delete farm")
	}

	a.logger.Info("Farm deleted successfully", "farmId", input.FarmID, "ownerId", userID)

	return &DeleteFarmOutput{
		Body: struct {
			Message string `json:"message"`
		}{Message: "Farm deleted successfully"},
	}, nil
}
