package api

import (
	"context"
	"errors"
	"net/http"
	"regexp"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/forfarm/backend/internal/utilities"
	"github.com/go-chi/chi/v5"
	validation "github.com/go-ozzo/ozzo-validation/v4"
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
		Email    string `json:"email" example:"Email address of the user"`
		Password string `json:"password" example:"Password of the user"`
	}
}

type LoginOutput struct {
	Body struct {
		Token string `json:"token" example:"JWT token for the user"`
	}
}

type RegisterInput struct {
	Body struct {
		Email    string `json:"email" example:"Email address of the user"`
		Password string `json:"password" example:"Password of the user"`
	}
}

type RegisterOutput struct {
	Body struct {
		Token string `json:"token" example:"JWT token for the user"`
	}
}

func validateEmail(email string) error {
	return validation.Validate(email,
		validation.Required.Error("email is required"),
		validation.Match(regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`)).Error("invalid email format"),
	)
}

func validatePassword(password string) error {
	return validation.Validate(password,
		validation.Required.Error("password is required"),
		validation.Length(8, 0).Error("password must be at least 8 characters long"),
		validation.Match(regexp.MustCompile(`[A-Z]`)).Error("password must contain at least one uppercase letter"),
		validation.Match(regexp.MustCompile(`[a-z]`)).Error("password must contain at least one lowercase letter"),
		validation.Match(regexp.MustCompile(`[0-9]`)).Error("password must contain at least one numeral"),
		validation.Match(regexp.MustCompile(`[\W_]`)).Error("password must contain at least one special character"),
	)
}

func (a *api) registerHandler(ctx context.Context, input *RegisterInput) (*RegisterOutput, error) {
	resp := &RegisterOutput{}

	if input == nil {
		return nil, errors.New("invalid input")
	}

	if err := validateEmail(input.Body.Email); err != nil {
		return nil, err
	}
	if err := validatePassword(input.Body.Password); err != nil {
		return nil, err
	}

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

		user, err := a.userRepo.GetByEmail(ctx, input.Body.Email)
		if err != nil {
			return nil, err
		}

		token, err := utilities.CreateJwtToken(user.UUID)
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

	if input == nil {
		return nil, errors.New("invalid input")
	}
	if input.Body.Email == "" {
		return nil, errors.New("email field is required")
	}
	if input.Body.Password == "" {
		return nil, errors.New("password field is required")
	}

	if err := validateEmail(input.Body.Email); err != nil {
		return nil, err
	}

	user, err := a.userRepo.GetByEmail(ctx, input.Body.Email)
	if err != nil {
		return nil, err
	}

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
