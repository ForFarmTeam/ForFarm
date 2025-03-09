package api

import (
	"context"
	"errors"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/utilities"
	"github.com/go-chi/chi/v5"
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

// exchangeHandler now assumes the provided access token is a Google ID token.
// It verifies the token with Google and then generates your own JWT.
func (a *api) exchangeHandler(ctx context.Context, input *ExchangeTokenInput) (*ExchangeTokenOutput, error) {
	if input.Body.AccessToken == "" {
		return nil, errors.New("access token is required")
	}

	googleUserID, email, err := utilities.ExtractGoogleUserID(input.Body.AccessToken)
	if err != nil {
		return nil, errors.New("invalid Google ID token")
	}

	newJWT, err := utilities.CreateJwtToken(googleUserID)
	if err != nil {
		return nil, err
	}

	resp := &ExchangeTokenOutput{}
	resp.Body.JWT = newJWT
	resp.Body.Email = email
	return resp, nil
}
