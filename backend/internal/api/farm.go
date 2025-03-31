package api

import (
	"context"
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
		Path:        prefix + "/{farm_id}",
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
		Path:        prefix + "/{farm_id}",
		Tags:        tags,
	}, a.updateFarmHandler)

	huma.Register(api, huma.Operation{
		OperationID: "deleteFarm",
		Method:      http.MethodDelete,
		Path:        prefix + "/{farm_id}",
		Tags:        tags,
	}, a.deleteFarmHandler)
}

//
// Input and Output types
//

// CreateFarmInput contains the request data for creating a new farm.
type CreateFarmInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	Body   struct {
		Name      string  `json:"Name"`
		Lat       float64 `json:"Lat"`
		Lon       float64 `json:"Lon"`
		FarmType  string  `json:"FarmType,omitempty"`
		TotalSize string  `json:"TotalSize,omitempty"`
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
	Body []domain.Farm
}

type GetFarmByIDInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farm_id"`
}

type GetFarmByIDOutput struct {
	Body domain.Farm
}

// UpdateFarmInput uses pointer types for optional/nullable fields.
type UpdateFarmInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farm_id"`
	Body   struct {
		Name      string   `json:"name,omitempty"`
		Lat       *float64 `json:"lat,omitempty"`
		Lon       *float64 `json:"lon,omitempty"`
		FarmType  *string  `json:"farm_type,omitempty"`
		TotalSize *string  `json:"total_size,omitempty"`
	}
}

type UpdateFarmOutput struct {
	Body domain.Farm
}

type DeleteFarmInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farm_id"`
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
		return nil, err
	}

	farm := &domain.Farm{
		Name:      input.Body.Name,
		Lat:       input.Body.Lat,
		Lon:       input.Body.Lon,
		FarmType:  input.Body.FarmType,
		TotalSize: input.Body.TotalSize,
		OwnerID:   userID,
	}
	fmt.Println(farm)
	if err := a.farmRepo.CreateOrUpdate(ctx, farm); err != nil {
		return nil, huma.Error500InternalServerError("failed to create farm", err)
	}

	return &CreateFarmOutput{
		Body: struct {
			UUID string `json:"uuid"`
		}{UUID: farm.UUID},
	}, nil
}

func (a *api) getAllFarmsHandler(ctx context.Context, input *GetAllFarmsInput) (*GetAllFarmsOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, err
	}

	farms, err := a.farmRepo.GetByOwnerID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return &GetAllFarmsOutput{Body: farms}, nil
}

func (a *api) getFarmByIDHandler(ctx context.Context, input *GetFarmByIDInput) (*GetFarmByIDOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, err
	}

	farm, err := a.farmRepo.GetByID(ctx, input.FarmID)
	if err != nil {
		return nil, err
	}

	if farm.OwnerID != userID {
		return nil, huma.Error401Unauthorized("unauthorized")
	}

	return &GetFarmByIDOutput{Body: *farm}, nil
}

func (a *api) updateFarmHandler(ctx context.Context, input *UpdateFarmInput) (*UpdateFarmOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, err
	}

	farm, err := a.farmRepo.GetByID(ctx, input.FarmID)
	if err != nil {
		return nil, err
	}

	if farm.OwnerID != userID {
		return nil, huma.Error401Unauthorized("unauthorized")
	}

	if input.Body.Name != "" {
		farm.Name = input.Body.Name
	}
	if input.Body.Lat != nil {
		farm.Lat = *input.Body.Lat
	}
	if input.Body.Lon != nil {
		farm.Lon = *input.Body.Lon
	}
	if input.Body.FarmType != nil {
		farm.FarmType = *input.Body.FarmType
	}
	if input.Body.TotalSize != nil {
		farm.TotalSize = *input.Body.TotalSize
	}

	if err = a.farmRepo.CreateOrUpdate(ctx, farm); err != nil {
		return nil, err
	}

	return &UpdateFarmOutput{Body: *farm}, nil
}

func (a *api) deleteFarmHandler(ctx context.Context, input *DeleteFarmInput) (*DeleteFarmOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, err
	}

	farm, err := a.farmRepo.GetByID(ctx, input.FarmID)
	if err != nil {
		return nil, err
	}

	if farm.OwnerID != userID {
		return nil, huma.Error401Unauthorized("unauthorized")
	}

	if err := a.farmRepo.Delete(ctx, input.FarmID); err != nil {
		return nil, err
	}

	return &DeleteFarmOutput{
		Body: struct {
			Message string `json:"message"`
		}{Message: "Farm deleted successfully"},
	}, nil
}
