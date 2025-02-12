package cmd

import (
	"context"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

func Execute(ctx context.Context) int {
	_ = godotenv.Load()

	rootCmd := &cobra.Command{
		Use:   "forfarm",
		Short: "A smart farming software uses AI, weather data, and analytics to help farmers make better decisions and improve productivity",
	}

	rootCmd.AddCommand(APICmd(ctx))
	rootCmd.AddCommand(MigrateCmd(ctx, "pgx", os.Getenv("DATABASE_URL")))

	go func() {
		_ = http.ListenAndServe("localhost:8000", nil)
	}()

	if err := rootCmd.Execute(); err != nil {
		return 1
	}

	return 0
}
