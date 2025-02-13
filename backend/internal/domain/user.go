package domain

import (
	"context"
	"errors"
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
		validation.Field(&u.Username, validation.By(func(value interface{}) error {
			if value == nil {
				return nil
			}
			if value == "" {
				return nil
			}
			username, ok := value.(*string)
			if !ok {
				return errors.New("invalid type for username")
			}
			if len(*username) < 3 || len(*username) > 20 {
				return errors.New("username length must be between 3 and 20")
			}
			return nil
		})),
		validation.Field(&u.Password, validation.Required, validation.Length(6, 100)),
		validation.Field(&u.Email, validation.Required, is.Email),
	)
}

type UserRepository interface {
	GetByID(context.Context, int64) (User, error)
	GetByUsername(context.Context, string) (User, error)
	GetByEmail(context.Context, string) (User, error)
	CreateOrUpdate(context.Context, *User) error
	Delete(context.Context, int64) error
}
