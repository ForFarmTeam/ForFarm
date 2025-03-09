package api

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/forfarm/backend/internal/utilities"
	"github.com/go-chi/chi/v5"
)

func (a *api) registerUserRoutes(_ chi.Router, api huma.API) {
	tags := []string{"user"}
	prefix := "/user"

	huma.Register(api, huma.Operation{
		OperationID: "getSelfData",
		Method:      http.MethodGet,
		Path:        prefix + "/me",
		Tags:        tags,
	}, a.getSelfData)
}

type getSelfDataInput struct {
	Authorization string `header:"Authorization" required:"true" example:"Bearer token"`
}

type getSelfDataOutput struct {
	Body struct {
		User domain.User `json:"user"`
	}
}

func (a *api) getSelfData(ctx context.Context, input *getSelfDataInput) (*getSelfDataOutput, error) {
	resp := &getSelfDataOutput{}

	authHeader := input.Authorization
	if authHeader == "" {
		return nil, fmt.Errorf("no authorization header provided")
	}

	authToken := strings.TrimPrefix(authHeader, "Bearer ")
	if authToken == "" {
		return nil, fmt.Errorf("no token provided")
	}

	uuid, err := utilities.ExtractUUIDFromToken(authToken)
	if err != nil {
		return nil, err
	}

	user, err := a.userRepo.GetByUUID(ctx, uuid)
	if err != nil {
		return nil, err
	}

	resp.Body.User = user
	return resp, nil
}
