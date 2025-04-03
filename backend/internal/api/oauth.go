package api

import (
	"context"
	"crypto/rand"
	"database/sql"
	"errors"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/forfarm/backend/internal/utilities"
	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"
)

func (a *api) registerOauthRoutes(_ chi.Router, apiInstance huma.API) {
	tags := []string{"oauth"}
	huma.Register(apiInstance, huma.Operation{
		OperationID: "oauth_exchange",
		Method:      http.MethodPost,
		Path:        "/oauth/exchange",
		Tags:        tags,
	}, a.exchangeHandler)
}

type ExchangeTokenInput struct {
	Body struct {
		AccessToken string `json:"accessToken" required:"true" example:"Google ID token"`
	}
}

type ExchangeTokenOutput struct {
	Body struct {
		JWT   string `json:"jwt" example:"Fresh JWT for frontend authentication"`
		Email string `json:"email" example:"Email address of the user"`
	}
}

func generateRandomPassword(length int) (string, error) {
	const charset = "abcdefghijklmnopqrstuvwxyz" +
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}<>?,./"

	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	for i, b := range bytes {
		bytes[i] = charset[b%byte(len(charset))]
	}
	return string(bytes), nil
}

func (a *api) exchangeHandler(ctx context.Context, input *ExchangeTokenInput) (*ExchangeTokenOutput, error) {
	if input.Body.AccessToken == "" {
		return nil, huma.Error400BadRequest("accessToken is required") // Match JSON tag
	}

	googleUserID, email, err := utilities.ExtractGoogleUserID(input.Body.AccessToken)
	if err != nil {
		a.logger.Warn("Invalid Google ID token received", "error", err)
		return nil, huma.Error401Unauthorized("Invalid Google ID token", err)
	}
	if email == "" {
		a.logger.Error("Google token verification succeeded but email is missing", "googleUserId", googleUserID)
		return nil, huma.Error500InternalServerError("Failed to retrieve email from Google token")
	}

	user, err := a.userRepo.GetByEmail(ctx, email)
	if errors.Is(err, domain.ErrNotFound) || errors.Is(err, sql.ErrNoRows) {
		a.logger.Info("Creating new user from Google OAuth", "email", email, "googleUserId", googleUserID)

		newPassword, passErr := generateRandomPassword(16) // Increase length
		if passErr != nil {
			a.logger.Error("Failed to generate random password for OAuth user", "error", passErr)
			return nil, huma.Error500InternalServerError("User creation failed (password generation)")
		}

		hashedPassword, hashErr := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
		if hashErr != nil {
			a.logger.Error("Failed to hash generated password for OAuth user", "error", hashErr)
			return nil, huma.Error500InternalServerError("User creation failed (password hashing)")
		}

		newUser := &domain.User{
			Email:    email,
			Password: string(hashedPassword), // Store hashed random password
			IsActive: true,                   // Activate user immediately
			// Username can be initially empty or derived from email if needed
		}
		if createErr := a.userRepo.CreateOrUpdate(ctx, newUser); createErr != nil {
			a.logger.Error("Failed to save new OAuth user to database", "email", email, "error", createErr)
			return nil, huma.Error500InternalServerError("Failed to create user account")
		}
		user = *newUser
	} else if err != nil {
		a.logger.Error("Database error looking up user by email during OAuth", "email", email, "error", err)
		return nil, huma.Error500InternalServerError("Failed to process login")
	}

	// Ensure the existing user is active
	if !user.IsActive {
		a.logger.Warn("OAuth login attempt for inactive user", "email", email, "user_uuid", user.UUID)
		return nil, huma.Error403Forbidden("Account is inactive")
	}

	// Generate JWT for the user (either existing or newly created)
	token, err := utilities.CreateJwtToken(user.UUID)
	if err != nil {
		a.logger.Error("Failed to create JWT token after OAuth exchange", "user_uuid", user.UUID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to generate session token")
	}

	output := &ExchangeTokenOutput{}
	output.Body.JWT = token
	output.Body.Email = email // Return the email for frontend context
	_ = googleUserID          // Maybe log or store this association if needed later

	a.logger.Info("OAuth exchange successful", "email", email, "user_uuid", user.UUID)
	return output, nil
}
