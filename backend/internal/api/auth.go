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
		// Use camelCase for JSON tags
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
		// Return validation error in a structured way if Huma supports it, otherwise basic error
		return nil, huma.Error422UnprocessableEntity("Validation failed", err)
	}
	if err := validatePassword(input.Body.Password); err != nil {
		return nil, huma.Error422UnprocessableEntity("Validation failed", err)
	}

	_, err := a.userRepo.GetByEmail(ctx, input.Body.Email)
	// Check if the error is specifically ErrNotFound
	if errors.Is(err, domain.ErrNotFound) {
		hashedPassword, hashErr := bcrypt.GenerateFromPassword([]byte(input.Body.Password), bcrypt.DefaultCost)
		if hashErr != nil {
			a.logger.Error("Failed to hash password during registration", "error", hashErr)
			return nil, huma.Error500InternalServerError("Registration failed due to internal error")
		}

		newUser := &domain.User{
			Email:    input.Body.Email,
			Password: string(hashedPassword),
			IsActive: true,
		}

		createErr := a.userRepo.CreateOrUpdate(ctx, newUser)
		if createErr != nil {
			a.logger.Error("Failed to create user", "email", input.Body.Email, "error", createErr)
			// Check for specific database errors if needed (e.g., unique constraint violation)
			return nil, huma.Error500InternalServerError("Failed to register user")
		}

		token, tokenErr := utilities.CreateJwtToken(newUser.UUID)
		if tokenErr != nil {
			a.logger.Error("Failed to create JWT token after registration", "user_uuid", newUser.UUID, "error", tokenErr)
			// Consider how to handle this - user is created but can't log in immediately.
			// Maybe log the error and return success but without a token? Or return an error.
			return nil, huma.Error500InternalServerError("Registration partially succeeded, but failed to generate token")
		}

		resp.Body.Token = token
		return resp, nil
	} else if err == nil {
		return nil, huma.Error409Conflict("User with this email already exists")
	} else {
		// Other database error occurred during GetByEmail
		a.logger.Error("Database error checking user email", "email", input.Body.Email, "error", err)
		return nil, huma.Error500InternalServerError("Failed to check user existence")
	}
}

func (a *api) loginHandler(ctx context.Context, input *LoginInput) (*LoginOutput, error) {
	resp := &LoginOutput{}

	if input == nil {
		return nil, huma.Error400BadRequest("Invalid input: missing request body")
	}
	if input.Body.Email == "" {
		return nil, huma.Error400BadRequest("Email field is required")
	}
	if input.Body.Password == "" {
		return nil, huma.Error400BadRequest("Password field is required")
	}

	if err := validateEmail(input.Body.Email); err != nil {
		return nil, huma.Error422UnprocessableEntity("Validation failed", err)
	}

	user, err := a.userRepo.GetByEmail(ctx, input.Body.Email)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			a.logger.Warn("Login attempt for non-existent user", "email", input.Body.Email)
			return nil, huma.Error401Unauthorized("Invalid email or password") // Generic error for security
		}
		a.logger.Error("Database error during login lookup", "email", input.Body.Email, "error", err)
		return nil, huma.Error500InternalServerError("Login failed due to an internal error")
	}

	// Check if the user is active
	if !user.IsActive {
		a.logger.Warn("Login attempt for inactive user", "email", input.Body.Email, "user_uuid", user.UUID)
		return nil, huma.Error403Forbidden("Account is inactive")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Body.Password)); err != nil {
		a.logger.Warn("Incorrect password attempt", "email", input.Body.Email, "user_uuid", user.UUID)
		// Do not differentiate between wrong email and wrong password for security
		return nil, huma.Error401Unauthorized("Invalid email or password")
	}

	token, err := utilities.CreateJwtToken(user.UUID)
	if err != nil {
		a.logger.Error("Failed to create JWT token during login", "user_uuid", user.UUID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to generate login token")
	}

	resp.Body.Token = token
	return resp, nil
}
