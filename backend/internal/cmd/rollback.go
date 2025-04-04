package cmd

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"strconv"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
	"github.com/spf13/cobra"

	"github.com/forfarm/backend/migrations"
)

func RollbackCmd(ctx context.Context, dbDriver, dbSource string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "rollback [version]",
		Short: "Rollback database migrations to a specific version",
		Args:  cobra.ExactArgs(1), // Ensure exactly one argument is provided
		RunE: func(cmd *cobra.Command, args []string) error {
			logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

			db, err := sql.Open(dbDriver, dbSource)
			if err != nil {
				return fmt.Errorf("failed to open database: %w", err)
			}
			defer db.Close()

			targetVersion := args[0]
			targetVersionInt, err := strconv.Atoi(targetVersion)
			if err != nil {
				logger.Error("failed to convert version to integer", "version", targetVersion)
				return err
			}
			targetVersionInt64 := int64(targetVersionInt)

			if err := goose.SetDialect(dbDriver); err != nil {
				return fmt.Errorf("failed to set dialect: %w", err)
			}

			if err := goose.DownTo(db, migrations.MigrationsDir, targetVersionInt64); err != nil {
				return fmt.Errorf("failed to rollback to version %s: %w", targetVersion, err)
			}

			logger.Info("Successfully rolled back to version", "version", targetVersion)
			return nil
		},
	}

	return cmd
}
