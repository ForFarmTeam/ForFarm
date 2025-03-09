package api

import (
	"context"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/go-chi/chi/v5"
)

func (a *api) registerFarmRoutes(_ chi.Router, api huma.API) {
	tags := []string{"farm"}
	prefix := "/farm"

	huma.Register(api, huma.Operation{
		OperationID: "createFarm",
		Method:      http.MethodPost,
		Path:        prefix,
		Tags:        tags,
	}, a.createFarmHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getFarmsByOwner",
		Method:      http.MethodGet,
		Path:        prefix + "/owner/{owner_id}",
		Tags:        tags,
	}, a.getFarmsByOwnerHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getFarmByID",
		Method:      http.MethodGet,
		Path:        prefix + "/{farm_id}",
		Tags:        tags,
	}, a.getFarmByIDHandler)

	huma.Register(api, huma.Operation{
		OperationID: "deleteFarm",
		Method:      http.MethodDelete,
		Path:        prefix + "/{farm_id}",
		Tags:        tags,
	}, a.deleteFarmHandler)
}

type CreateFarmInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	Body   struct {
		Name    string    `json:"name"`
		Lat     []float64 `json:"lat"`
		Lon     []float64 `json:"lon"`
		OwnerID string    `json:"owner_id"`
	}
}

type CreateFarmOutput struct {
	Body struct {
		UUID string `json:"uuid"`
	}
}

func (a *api) createFarmHandler(ctx context.Context, input *CreateFarmInput) (*CreateFarmOutput, error) {
	farm := &domain.Farm{
		Name:    input.Body.Name,
		Lat:     input.Body.Lat,
		Lon:     input.Body.Lon,
		OwnerID: input.Body.OwnerID,
	}

	err := a.farmRepo.CreateOrUpdate(ctx, farm)
	if err != nil {
		return nil, err
	}

	return &CreateFarmOutput{Body: struct {
		UUID string `json:"uuid"`
	}{UUID: farm.UUID}}, nil
}

type GetFarmsByOwnerInput struct {
	Header  string `header:"Authorization" required:"true" example:"Bearer token"`
	OwnerID string `path:"owner_id"`
}

type GetFarmsByOwnerOutput struct {
	Body []domain.Farm
}

func (a *api) getFarmsByOwnerHandler(ctx context.Context, input *GetFarmsByOwnerInput) (*GetFarmsByOwnerOutput, error) {
	farms, err := a.farmRepo.GetByOwnerID(ctx, input.OwnerID)
	if err != nil {
		return nil, err
	}

	return &GetFarmsByOwnerOutput{Body: farms}, nil
}

type GetFarmByIDInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	FarmID string `path:"farm_id"`
}

type GetFarmByIDOutput struct {
	Body domain.Farm
}

func (a *api) getFarmByIDHandler(ctx context.Context, input *GetFarmByIDInput) (*GetFarmByIDOutput, error) {
	farm, err := a.farmRepo.GetByID(ctx, input.FarmID)
	if err != nil {
		return nil, err
	}

	return &GetFarmByIDOutput{Body: farm}, nil
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

func (a *api) deleteFarmHandler(ctx context.Context, input *DeleteFarmInput) (*DeleteFarmOutput, error) {
	err := a.farmRepo.Delete(ctx, input.FarmID)
	if err != nil {
		return nil, err
	}

	return &DeleteFarmOutput{Body: struct {
		Message string `json:"message"`
	}{Message: "Farm deleted successfully"}}, nil
}
