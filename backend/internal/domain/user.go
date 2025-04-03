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
	ID        int64     `json:"id"`
	UUID      string    `json:"uuid"`
	Username  string    `json:"username,omitempty"`
	Password  string    `json:"-"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	IsActive  bool      `json:"isActive"`
}

func (u *User) NormalizedUsername() string {
	return strings.ToLower(u.Username)
}

func (u *User) Validate() error {
	return validation.ValidateStruct(u,
		validation.Field(&u.UUID, validation.Required),
		validation.Field(&u.Username, validation.By(func(value interface{}) error {
			// Username is now optional
			if value == nil {
				return nil
			}
			if strVal, ok := value.(string); ok && strVal == "" {
				return nil
			}
			username, ok := value.(*string)
			if !ok {
				// If it's a string but not a pointer, handle it
				if strVal, ok := value.(string); ok {
					if len(strVal) < 3 || len(strVal) > 20 {
						return errors.New("username length must be between 3 and 20")
					}
					return nil
				}
				return errors.New("invalid type for username")
			}
			if username == nil || *username == "" {
				return nil // Optional field is valid if empty or nil
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
	GetByUUID(context.Context, string) (User, error)
	GetByUsername(context.Context, string) (User, error)
	GetByEmail(context.Context, string) (User, error)
	CreateOrUpdate(context.Context, *User) error
	Delete(context.Context, int64) error
}
