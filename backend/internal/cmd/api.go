package cmd

import (
	"context"
	"os"

	"log/slog"
	"net/http"

	"github.com/spf13/cobra"

	"github.com/forfarm/backend/internal/api"
	"github.com/forfarm/backend/internal/cmdutil"
)

func APICmd(ctx context.Context) *cobra.Command {
	var port int = 8000

	cmd := &cobra.Command{
		Use:   "api",
		Args:  cobra.ExactArgs(0),
		Short: "Run RESTful API",
		RunE: func(cmd *cobra.Command, args []string) error {
			logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

			pool, err := cmdutil.NewDatabasePool(ctx, 16)
			if err != nil {
				return err
			}
			defer pool.Close()

			api := api.NewAPI(ctx, logger)
			server := api.Server(port)

			go func() {
				if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					logger.Error("failed to start server", "err", err)
				}
			}()

			logger.Info("started API", "port", port)

			<-ctx.Done()

			if err := server.Shutdown(ctx); err != nil {
				logger.Error("failed to gracefully shutdown server", "err", err)
			}

			return nil
		},
	}

	return cmd
}
