package api

import (
	"context"
	"errors"
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

// getSelfDataOutput uses domain.User which now has camelCase tags
type getSelfDataOutput struct {
	Body struct {
		User domain.User `json:"user"`
	}
}

func (a *api) getSelfData(ctx context.Context, input *getSelfDataInput) (*getSelfDataOutput, error) {
	resp := &getSelfDataOutput{}

	authHeader := input.Authorization
	if authHeader == "" {
		return nil, huma.Error401Unauthorized("No authorization header provided")
	}

	authToken := strings.TrimPrefix(authHeader, "Bearer ")
	if authToken == "" {
		return nil, huma.Error401Unauthorized("No token provided in Authorization header")
	}

	uuid, err := utilities.ExtractUUIDFromToken(authToken)
	if err != nil {
		a.logger.Warn("Failed to extract UUID from token", "error", err)
		return nil, huma.Error401Unauthorized("Invalid or expired token", err)
	}

	user, err := a.userRepo.GetByUUID(ctx, uuid)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			a.logger.Warn("User data not found for valid token UUID", "user_uuid", uuid)
			return nil, huma.Error404NotFound(fmt.Sprintf("User data not found for UUID: %s", uuid))
		}
		a.logger.Error("Failed to get user data by UUID", "user_uuid", uuid, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve user data")
	}

	// Ensure password is not included in the response (already handled by `json:"-"`)
	// user.Password = "" // Redundant if json tag is "-"

	resp.Body.User = user
	return resp, nil
}
