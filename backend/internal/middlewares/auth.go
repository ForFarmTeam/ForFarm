package middlewares

import (
	"net/http"
	"strings"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/utilities"
)

func AuthMiddleware(api huma.API) func(ctx huma.Context, next func(huma.Context)) {
	return func(ctx huma.Context, next func(huma.Context)) {
		authHeader := ctx.Header("Authorization")
		if authHeader == "" {
			huma.WriteErr(api, ctx, http.StatusUnauthorized, "No token provided")
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == "" {
			huma.WriteErr(api, ctx, http.StatusUnauthorized, "No token provided")
			return
		}

		err := utilities.VerifyJwtToken(tokenStr)

		if err != nil {
			huma.WriteErr(api, ctx, http.StatusUnauthorized, "Invalid token")
			return
		}

		next(ctx)
	}

}
