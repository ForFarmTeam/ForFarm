package repository

import (
	"context"
	"strings"

	"github.com/google/uuid"

	"github.com/forfarm/backend/internal/domain"
)

type postgresUserRepository struct {
	conn Connection
}

func NewPostgresUser(conn Connection) domain.UserRepository {
	return &postgresUserRepository{conn: conn}
}

func (p *postgresUserRepository) fetch(ctx context.Context, query string, args ...interface{}) ([]domain.User, error) {
	rows, err := p.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(
			&u.ID,
			&u.UUID,
			&u.Username,
			&u.Password,
			&u.Email,
			&u.CreatedAt,
			&u.UpdatedAt,
			&u.IsActive,
		); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func (p *postgresUserRepository) GetByID(ctx context.Context, id int64) (domain.User, error) {
	query := `
		SELECT id, uuid, username, password, email, created_at, updated_at, is_active
		FROM users
		WHERE id = $1`

	users, err := p.fetch(ctx, query, id)
	if err != nil {
		return domain.User{}, err
	}
	if len(users) == 0 {
		return domain.User{}, domain.ErrNotFound
	}
	return users[0], nil
}

func (p *postgresUserRepository) GetByUsername(ctx context.Context, username string) (domain.User, error) {
	query := `
		SELECT id, uuid, username, password, email, created_at, updated_at, is_active  
		FROM users
		WHERE username = $1`

	username = strings.ToLower(username)

	users, err := p.fetch(ctx, query, username)
	if err != nil {
		return domain.User{}, err
	}
	if len(users) == 0 {
		return domain.User{}, domain.ErrNotFound
	}
	return users[0], nil
}

func (p *postgresUserRepository) CreateOrUpdate(ctx context.Context, u *domain.User) error {
	if err := u.Validate(); err != nil {
		return err
	}

	if strings.TrimSpace(u.UUID) == "" {
		u.UUID = uuid.New().String()
	}

	u.NormalizedUsername()

	query := `  
		INSERT INTO users (uuid, username, password, email, created_at, updated_at, is_active)  
		VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
		ON CONFLICT (uuid) DO UPDATE
		SET username = EXCLUDED.username,
		    password = EXCLUDED.password,
		    email = EXCLUDED.email,
		    updated_at = NOW(),
		    is_active = EXCLUDED.is_active
		RETURNING id, created_at, updated_at`

	return p.conn.QueryRow(
		ctx,
		query,
		u.UUID,
		u.Username,
		u.Password,
		u.Email,
		u.IsActive,
	).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
}

func (p *postgresUserRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := p.conn.Exec(ctx, query, id)
	return err
}
