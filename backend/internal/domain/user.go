package domain

import (
	"context"
	"strings"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

type User struct {
	ID        int64
	UUID      string
	Username  string
	Password  string
	Email     string
	CreatedAt time.Time
	UpdatedAt time.Time
	IsActive  bool
}

func (u *User) NormalizedUsername() string {
	return strings.ToLower(u.Username)
}

func (u *User) Validate() error {
	return validation.ValidateStruct(u,
		validation.Field(&u.UUID, validation.Required),
		validation.Field(&u.Username, validation.Required, validation.Length(3, 20)),
		validation.Field(&u.Password, validation.Required, validation.Length(6, 100)),
		validation.Field(&u.Email, validation.Required, is.Email),
	)
}

type UserRepository interface {
	GetByID(context.Context, int64) (User, error)
	GetByUsername(context.Context, string) (User, error)
	CreateOrUpdate(context.Context, *User) error
	Delete(context.Context, int64) error
}
