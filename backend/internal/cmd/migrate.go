package cmd

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
	"github.com/spf13/cobra"

	"github.com/forfarm/backend/migrations"
)

func MigrateCmd(ctx context.Context, dbDriver, dbSource string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "migrate",
		Short: "Run database migrations",
		RunE: func(cmd *cobra.Command, args []string) error {
			logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

			db, err := sql.Open(dbDriver, dbSource)
			if err != nil {
				return fmt.Errorf("failed to open database: %w", err)
			}
			defer db.Close()

			goose.SetBaseFS(migrations.EmbedMigrations)

			if err := goose.UpContext(ctx, db, "."); err != nil {
				return fmt.Errorf("failed to run migrations: %w", err)
			}

			logger.Info("Database migrations have been applied successfully")
			return nil
		},
	}

	return cmd
}
