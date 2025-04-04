FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies (if any, e.g., for CGO)
# RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./

RUN go mod download

COPY . .

# Build the application binary
# Statically link if possible (reduces dependencies in final image)
# RUN CGO_ENABLED=0 go build -ldflags="-w -s" -o ./tmp/api ./cmd/forfarm
# Or standard build if CGO is needed or static linking causes issues
RUN go build -o ./tmp/api ./cmd/forfarm

# --- Runner Stage ---
FROM alpine:latest

# Set working directory
WORKDIR /app

# Install runtime dependencies (ca-certificates for HTTPS, tzdata for timezones)
RUN apk add --no-cache ca-certificates tzdata

# Copy the compiled binary from the builder stage
COPY --from=builder /app/tmp/api /app/api

# Copy migrations directory (needed if running migrations from container)
COPY migrations ./migrations

# Copy .env file (for local/compose - NOT for production K8s)
# If you intend to run migrations inside the container on start,
# the DATABASE_URL needs to be available. Secrets/ConfigMaps are preferred in K8s.
# COPY .env .env

# Expose the port the application listens on
EXPOSE 8000

# Define the entrypoint - runs the API server by default
# Migrations should ideally be run as a separate step or init container
ENTRYPOINT ["/app/api"]

# Default command (in case ENTRYPOINT is just the binary)
CMD ["api"]