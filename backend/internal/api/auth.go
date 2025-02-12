package api

import (
	"context"
	"errors"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/forfarm/backend/internal/utilities"
	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"
)

func (a *api) registerAuthRoutes(_ chi.Router, api huma.API) {
	tags := []string{"auth"}

	prefix := "/auth"

	huma.Register(api, huma.Operation{
		OperationID: "register",
		Method:      http.MethodPost,
		Path:        prefix + "/register",
		Tags:        tags,
	}, a.registerHandler)

	huma.Register(api, huma.Operation{
		OperationID: "login",
		Method:      http.MethodPost,
		Path:        prefix + "/login",
		Tags:        tags,
	}, a.loginHandler)
}

type LoginInput struct {
	Body struct {
		Email    string `json:"email" example:" Email address of the user"`
		Password string `json:"password" example:" Password of the user"`
	}
}

type LoginOutput struct {
	Body struct {
		Token string `json:"token" example:" JWT token for the user"`
	}
}

type RegisterInput struct {
	Body struct {
		Email    string `json:"email" example:" Email address of the user"`
		Password string `json:"password" example:" Password of the user"`
	}
}

type RegisterOutput struct {
	Body struct {
		Token string `json:"token" example:" JWT token for the user"`
	}
}

func (a *api) registerHandler(ctx context.Context, input *RegisterInput) (*RegisterOutput, error) {
	resp := &RegisterOutput{}

	// TODO: Validate input data

	_, err := a.userRepo.GetByEmail(ctx, input.Body.Email)
	if err == domain.ErrNotFound {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Body.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}

		err = a.userRepo.CreateOrUpdate(ctx, &domain.User{
			Email:    input.Body.Email,
			Password: string(hashedPassword),
		})
		if err != nil {
			return nil, err
		}

		token, err := utilities.CreateJwtToken(input.Body.Email)
		if err != nil {
			return nil, err
		}

		resp.Body.Token = token
		return resp, nil
	}

	return nil, errors.New("user already exists")
}

func (a *api) loginHandler(ctx context.Context, input *LoginInput) (*LoginOutput, error) {
	resp := &LoginOutput{}

	// TODO: Validate input data

	user, err := a.userRepo.GetByEmail(ctx, input.Body.Email)
	if err != nil {
		return nil, err
	}

	// verify password hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Body.Password)); err != nil {
		return nil, err
	}

	token, err := utilities.CreateJwtToken(user.UUID)
	if err != nil {
		return nil, err
	}

	resp.Body.Token = token
	return resp, nil
}
