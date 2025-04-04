package api

import (
	"context"
	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/utilities"
	"golang.org/x/crypto/bcrypt"
	"log/slog"
	"os"
	"testing"

	"github.com/forfarm/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockUserRepository struct {
	mock.Mock
}

type EmailPasswordInput struct {
	Email    string `json:"email" example:"Email address of the user"`
	Password string `json:"password" example:"Password of the user"`
}

func (m *MockUserRepository) GetByID(ctx context.Context, id int64) (domain.User, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(domain.User), args.Error(1)
}

func (m *MockUserRepository) GetByUUID(ctx context.Context, uuid string) (domain.User, error) {
	args := m.Called(ctx, uuid)
	return args.Get(0).(domain.User), args.Error(1)
}

func (m *MockUserRepository) GetByUsername(ctx context.Context, username string) (domain.User, error) {
	args := m.Called(ctx, username)
	return args.Get(0).(domain.User), args.Error(1)
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (domain.User, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(domain.User), args.Error(1)
}

func (m *MockUserRepository) CreateOrUpdate(ctx context.Context, u *domain.User) error {
	args := m.Called(ctx, u)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(ctx context.Context, id int64) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestRegisterHandler(t *testing.T) {
	var tests = []struct {
		name          string
		input         RegisterInput
		mockSetup     func(*MockUserRepository)
		expectedError error
	}{
		{
			name: "successful registration",
			input: RegisterInput{
				Body: EmailPasswordInput{
					Email:    "test@example.com",
					Password: "ValidPass123!",
				},
			},
			mockSetup: func(m *MockUserRepository) {
				m.On("GetByEmail", mock.Anything, "test@example.com").Return(domain.User{}, domain.ErrNotFound)
				m.On("CreateOrUpdate", mock.Anything, mock.AnythingOfType("*domain.User")).Return(nil)
			},
			expectedError: nil,
		},

		{
			name: "existing email",
			input: RegisterInput{
				Body: struct {
					Email    string `json:"email" example:"Email address of the user"`
					Password string `json:"password" example:"Password of the user"`
				}(struct {
					Email    string `json:"email"`
					Password string `json:"password"`
				}{
					Email:    "existing@example.com",
					Password: "ValidPass123!",
				}),
			},
			mockSetup: func(m *MockUserRepository) {
				m.On("GetByEmail", mock.Anything, "existing@example.com").Return(domain.User{
					Email: "existing@example.com",
				}, nil)
			},
			expectedError: huma.Error409Conflict("User with this email already exists"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockUserRepository{}
			if tt.mockSetup != nil {
				tt.mockSetup(mockRepo)
			}

			api := &api{
				userRepo: mockRepo,
				logger:   nil,
			}

			_, err := api.registerHandler(context.Background(), &tt.input)

			if tt.expectedError == nil {
				assert.NoError(t, err)
			} else {
				assert.EqualError(t, err, tt.expectedError.Error())
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestLoginHandler(t *testing.T) {
	correctPassword := "ValidPass123!"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(correctPassword), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("Failed to generate bcrypt hash: %v", err)
	}

	userUUID := uuid.New().String()
	testUser := domain.User{
		UUID:     userUUID,
		Email:    "test@example.com",
		Password: string(hashedPassword),
		IsActive: true,
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelError,
	}))

	tests := []struct {
		name          string
		input         LoginInput
		mockSetup     func(*MockUserRepository)
		expectedError error
	}{
		{
			name: "successful login",
			input: LoginInput{
				Body: EmailPasswordInput{
					Email:    "test@example.com",
					Password: correctPassword,
				},
			},
			mockSetup: func(m *MockUserRepository) {
				m.On("GetByEmail", mock.Anything, "test@example.com").Return(testUser, nil)
			},
			expectedError: nil,
		},
		{
			name: "invalid credentials",
			input: LoginInput{
				Body: EmailPasswordInput{
					Email:    "test@example.com",
					Password: "wrongpassword",
				},
			},
			mockSetup: func(m *MockUserRepository) {
				m.On("GetByEmail", mock.Anything, "test@example.com").Return(testUser, nil)
			},
			expectedError: huma.Error401Unauthorized("Invalid email or password"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockUserRepository{}
			if tt.mockSetup != nil {
				tt.mockSetup(mockRepo)
			}

			api := &api{
				userRepo: mockRepo,
				logger:   logger,
			}

			_, err := api.loginHandler(context.Background(), &tt.input)

			if tt.expectedError == nil {
				assert.NoError(t, err)
			} else {
				assert.EqualError(t, err, tt.expectedError.Error())
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestLoginHandler_TokenGeneration(t *testing.T) {
	userUUID := uuid.New().String()
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("ValidPass123!"), bcrypt.DefaultCost)
	testUser := domain.User{
		UUID:     userUUID,
		Email:    "test@example.com",
		Password: string(hashedPassword),
		IsActive: true,
	}

	mockRepo := &MockUserRepository{}
	mockRepo.On("GetByEmail", mock.Anything, "test@example.com").Return(testUser, nil)

	api := &api{
		userRepo: mockRepo,
		logger:   nil,
	}

	input := &LoginInput{
		Body: EmailPasswordInput{
			Email:    "test@example.com",
			Password: "ValidPass123!",
		},
	}

	output, err := api.loginHandler(context.Background(), input)
	assert.NoError(t, err)
	assert.NotEmpty(t, output.Body.Token)

	err = utilities.VerifyJwtToken(output.Body.Token)
	assert.NoError(t, err)

	extractedUUID, err := utilities.ExtractUUIDFromToken(output.Body.Token)
	assert.NoError(t, err)
	assert.Equal(t, userUUID, extractedUUID)
}
