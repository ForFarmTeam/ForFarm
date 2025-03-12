package api

import (
	"context"
	"crypto/rand"
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
		AccessToken string `json:"access_token" example:"Google ID token obtained after login"`
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

// exchangeHandler assumes the provided access token is a Google ID token.
// It verifies the token with Google, and if the user doesn't exist,
// it creates a new user with a randomly generated password before issuing your JWT.
func (a *api) exchangeHandler(ctx context.Context, input *ExchangeTokenInput) (*ExchangeTokenOutput, error) {
	if input.Body.AccessToken == "" {
		return nil, errors.New("access token is required")
	}

	googleUserID, email, err := utilities.ExtractGoogleUserID(input.Body.AccessToken)
	if err != nil {
		return nil, errors.New("invalid Google ID token")
	}

	user, err := a.userRepo.GetByEmail(ctx, email)
	if err == domain.ErrNotFound {
		newPassword, err := generateRandomPassword(12)
		if err != nil {
			return nil, err
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}

		newUser := &domain.User{
			Email:    email,
			Password: string(hashedPassword),
		}
		if err := a.userRepo.CreateOrUpdate(ctx, newUser); err != nil {
			return nil, err
		}
		user = *newUser
	} else if err != nil {
		return nil, err
	}

	token, err := utilities.CreateJwtToken(user.UUID)
	if err != nil {
		return nil, err
	}

	output := &ExchangeTokenOutput{}
	output.Body.JWT = token
	output.Body.Email = email
	_ = googleUserID // Maybe need in the future
	return output, nil
}
