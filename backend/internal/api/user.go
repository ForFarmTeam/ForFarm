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
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/jackc/pgx/v5"
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

type UpdateSelfDataInput struct {
	Authorization string `header:"Authorization" required:"true" example:"Bearer token"`
	Body          struct {
		Username *string `json:"username,omitempty"`
	}
}

type UpdateSelfDataOutput struct {
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

func (a *api) updateSelfData(ctx context.Context, input *UpdateSelfDataInput) (*UpdateSelfDataOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Authorization)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}

	user, err := a.userRepo.GetByUUID(ctx, userID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) || errors.Is(err, pgx.ErrNoRows) {
			a.logger.Warn("Attempt to update non-existent user", "user_uuid", userID)
			return nil, huma.Error404NotFound("User not found")
		}
		a.logger.Error("Failed to get user for update", "user_uuid", userID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to retrieve user for update")
	}

	updated := false
	if input.Body.Username != nil {
		trimmedUsername := strings.TrimSpace(*input.Body.Username)
		if trimmedUsername != user.Username {
			err := validation.Validate(trimmedUsername,
				validation.Required.Error("username cannot be empty if provided"),
				validation.Length(3, 30).Error("username must be between 3 and 30 characters"),
			)
			if err != nil {
				return nil, huma.Error422UnprocessableEntity("Invalid username", err)
			}
			user.Username = trimmedUsername
			updated = true
		}
	}
	// Check other field here la

	if !updated {
		a.logger.Info("No changes detected for user update", "user_uuid", userID)
		return &UpdateSelfDataOutput{Body: struct {
			User domain.User `json:"user"`
		}{User: user}}, nil
	}

	// Validate the *entire* user object after updates (optional but good practice)
	// if err := user.Validate(); err != nil {
	// 	return nil, huma.Error422UnprocessableEntity("Validation failed after update", err)
	// }

	// Save updated user
	err = a.userRepo.CreateOrUpdate(ctx, &user)
	if err != nil {
		a.logger.Error("Failed to update user in database", "user_uuid", userID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to save user profile")
	}

	a.logger.Info("User profile updated successfully", "user_uuid", userID)

	updatedUser, fetchErr := a.userRepo.GetByUUID(ctx, userID)
	if fetchErr != nil {
		a.logger.Error("Failed to fetch user data after update", "user_uuid", userID, "error", fetchErr)
		return &UpdateSelfDataOutput{Body: struct {
			User domain.User `json:"user"`
		}{User: user}}, nil
	}

	return &UpdateSelfDataOutput{Body: struct {
		User domain.User `json:"user"`
	}{User: updatedUser}}, nil
}
