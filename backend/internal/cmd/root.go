package cmd

import (
	"context"

	"github.com/forfarm/backend/internal/config"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

func Execute(ctx context.Context) int {
	_ = godotenv.Load()
	config.Load()

	rootCmd := &cobra.Command{
		Use:   "forfarm",
		Short: "A smart farming software uses AI, weather data, and analytics to help farmers make better decisions and improve productivity",
	}

	rootCmd.AddCommand(APICmd(ctx))
	rootCmd.AddCommand(MigrateCmd(ctx, "pgx", config.DATABASE_URL))

	if err := rootCmd.Execute(); err != nil {
		return 1
	}

	return 0
}
