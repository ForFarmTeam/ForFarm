# ForFarm Project Setup Guide

This guide provides instructions for setting up and running the ForFarm project using different methods.

## Prerequisites

Ensure you have the following tools installed:

- **Go:** Version 1.23 or later (see `backend/go.mod`).
- **Node.js:** Version 20 or later (see `frontend/next.dockerfile`).
- **pnpm:** Node package manager (`npm install -g pnpm`).
- **Docker:** Latest version.
- **Docker Compose:** Latest version (often included with Docker Desktop).
- **kubectl:** Kubernetes command-line tool.
- **gcloud:** Google Cloud SDK (if deploying to GKE).

## Configuration

Environment variables are used for configuration.

1.  **Backend:**

    - Copy `backend/sample.env` to `backend/.env`.
    - Fill in the required values in `backend/.env`:
      - `DATABASE_URL`: Connection string for your PostgreSQL database. (e.g., `postgres://postgres:@Password123@localhost:5433/postgres?sslmode=disable` for local Docker Compose setup).
      - `RABBITMQ_URL`: Connection string for RabbitMQ (e.g., `amqp://user:password@localhost:5672/` for local Docker Compose).
      - `JWT_SECRET_KEY`: A strong, random secret key (at least 32 characters).
      - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: For Google OAuth.
      - `OPENWEATHER_API_KEY`: Your OpenWeatherMap API key.
      - `GEMINI_API_KEY`: Your Google AI Gemini API key.
      - `GCS_BUCKET_NAME`: Your Google Cloud Storage bucket name.
      - `GCS_SERVICE_ACCOUNT_KEY_PATH`: (Optional) Path to your GCS service account key JSON file if _not_ using Application Default Credentials (ADC). Leave empty if using ADC (recommended for GKE with Workload Identity).

2.  **Frontend:**
    - Copy `frontend/sample.env` to `frontend/.env`.
    - Fill in the required values in `frontend/.env`:
      - `NEXT_PUBLIC_BACKEND_URL`: URL of the running backend API (e.g., `http://localhost:8000` for local/Compose).
      - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google Client ID for OAuth on the frontend.
      - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API Key.
      - (Other `NEXTAUTH_*` variables might be needed if you integrate `next-auth` fully).

## Running Locally (Manual Setup)

This method requires running services like Postgres and RabbitMQ separately.

1.  **Start Database:** Run PostgreSQL (e.g., using Docker: `docker run --name some-postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:16-alpine`). Ensure the `DATABASE_URL` in `backend/.env` points to it.
2.  **Start RabbitMQ:** Run RabbitMQ (e.g., using Docker: `docker run --name some-rabbit -p 5672:5672 -p 15672:15672 -d rabbitmq:3-management-alpine`). Ensure `RABBITMQ_URL` in `backend/.env` points to it.
3.  **Backend Migrations:**
    ```bash
    cd backend
    go run cmd/forfarm/main.go migrate
    ```
4.  **Run Backend API:**
    ```bash
    cd backend
    # For live reloading (requires air - go install github.com/cosmtrek/air@latest)
    # air
    # Or run directly
    go run cmd/forfarm/main.go api
    ```
    The backend should be running on `http://localhost:8000`.
5.  **Run Frontend:**

    ```bash
    cd frontend
    pnpm install
    pnpm dev
    ```

    The frontend should be running on `http://localhost:3000`.

6.  (Optional) Add dummy data in /backend/dummy directory to database

- Do it manually or `make seed`

## Installation Steps (In detailed)

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/your-username/ForFarm.git # Replace with your repo URL
    cd ForFarm
    ```

2.  **Environment Variables:**

    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - **Edit the `.env` file:** Fill in the required values, especially for:
      - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (you can keep defaults for local setup)
      - `JWT_SECRET_KEY` (generate a strong, random secret)
      - `GOOGLE_CLIENT_ID` (if using Google OAuth)
      - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Frontend Google Client ID)
      - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Required for maps)
      - `OPENWEATHER_API_KEY` (Required for weather features)
      - `GEMINI_API_KEY` (Required for AI chatbot features)
      - `RABBITMQ_URL` (Keep default if using the docker-compose setup)
      - (Optionally adjust `RATE_LIMIT_*` variables)

3.  **Build and Run Services:**
    Use Docker Compose to build the images and start the backend, frontend, and database containers.

    ```bash
    docker compose up --build -d
    ```

    - `--build`: Forces Docker to rebuild images if Dockerfiles have changed.
    - `-d`: Runs containers in detached mode (in the background).

4.  **Run Backend Database Migrations:**
    Apply the necessary database schema changes. Open a **new terminal** in the project root and navigate to the backend directory:

    ```bash
    cd backend
    make migrate
    cd ..
    ```

    - This command uses Go to connect to the database (running in Docker) and applies migrations located in `backend/migrations`.

5.  **Install Frontend Dependencies:**
    Navigate to the frontend directory and install its dependencies using pnpm.

    ```bash
    cd frontend
    pnpm install
    cd ..
    ```

    _(Docker Compose might handle this during build if configured in `next.dockerfile`, but running it explicitly ensures dependencies are up-to-date)_

6.  **Access the Application:**

    - **Frontend:** Open your browser and navigate to [http://localhost:3000](http://localhost:3000) (or the port specified by `FRONTEND_PORT` in your `.env`).
    - **Backend API:** The API is accessible at [http://localhost:8000](http://localhost:8000) (or the port specified by `BACKEND_PORT`). You can use tools like Postman or `curl` to interact with it.

7.  (Optional) Add dummy data in /backend/dummy directory to database

- Do it manually or `make seed`

## Running with Docker Compose

This is the recommended way for local development and testing the containerized setup.

1.  **Ensure `.env` files are configured** as described in the Configuration section. Use `localhost` for hostnames in URLs (e.g., `DATABASE_URL='postgres://postgres:@Password123@db:5432/postgres?sslmode=disable'`, `RABBITMQ_URL=amqp://user:password@rabbitmq:5672/` - note the service names `db` and `rabbitmq`).
2.  **Build and Start:**
    ```bash
    docker compose up --build -d # -d runs in detached mode
    ```
3.  **Run Migrations (First time or after changes):**
    ```bash
    docker compose exec backend /app/api migrate
    # Or if using source mount and go is available:
    # docker compose exec backend go run cmd/forfarm/main.go migrate
    ```
4.  **Access Services:**
    - Frontend: `http://localhost:3000`
    - Backend API: `http://localhost:8000`
    - RabbitMQ Management: `http://localhost:15672` (user/password from `.env`)
    - Database: Connect via `localhost:5433` using credentials from `.env`.
5.  **View Logs:** `docker compose logs -f [service_name]` (e.g., `docker compose logs -f backend`)
6.  **Stop:** `docker compose down`

## Development Workflow

- **Live Reload (Backend):** While `docker compose up -d` keeps the backend running, for active Go development with live reload, stop the backend service (`docker compose stop backend`) and run:
  ```bash
  cd backend
  make live
  ```
  This uses `air` (configured in `.air.toml`) to automatically rebuild and restart the Go application when code changes.
- **Live Reload (Frontend):** The `pnpm dev` command used in the frontend Dockerfile typically includes hot module replacement (HMR). Changes made to frontend code should reflect in the browser automatically when running `docker compose up`. If not, check the Next.js configuration.

## Deploying to Google Kubernetes Engine (GKE)

This requires a configured GKE cluster and `gcloud` CLI authenticated.

1.  **Prerequisites:**

    - Create a GKE cluster.
    - Configure `kubectl` to connect to your cluster (`gcloud container clusters get-credentials YOUR_CLUSTER_NAME --zone YOUR_ZONE --project YOUR_PROJECT_ID`).
    - Enable Google Container Registry (GCR) or Artifact Registry API.

2.  **Configure GCS:**

    - Create a GCS bucket (`YOUR_GCS_BUCKET_NAME`).
    - **Authentication:**
      - **(Recommended) Workload Identity:** Set up Workload Identity to grant your Kubernetes Service Account permissions to access the GCS bucket without key files. This involves creating a GCP Service Account, granting it `roles/storage.objectAdmin` on the bucket, creating a K8s Service Account (e.g., `backend-sa`), and binding them. Update `backend-deployment.yaml` to use `serviceAccountName: backend-sa`.
      - **(Alternative) Service Account Key:** Create a GCP Service Account, grant it permissions, download its JSON key file.

3.  **Build and Push Docker Images:**

    - Authenticate Docker with GCR/Artifact Registry (`gcloud auth configure-docker YOUR_REGION-docker.pkg.dev`).
    - Build the images:

      ```bash
      # Backend
      docker build -t YOUR_REGION-docker.pkg.dev/YOUR_GCR_PROJECT_ID/forfarm/backend:latest -f backend/go.dockerfile ./backend

      # Frontend
      docker build -t YOUR_REGION-docker.pkg.dev/YOUR_GCR_PROJECT_ID/forfarm/frontend:latest -f frontend/next.dockerfile ./frontend
      ```

    - Push the images:
      ```bash
      docker push YOUR_REGION-docker.pkg.dev/YOUR_GCR_PROJECT_ID/forfarm/backend:latest
      docker push YOUR_REGION-docker.pkg.dev/YOUR_GCR_PROJECT_ID/forfarm/frontend:latest
      ```
    - **Update `k8s/*.yaml` files:** Replace `YOUR_GCR_PROJECT_ID/forfarm-backend:latest` and `YOUR_GCR_PROJECT_ID/forfarm-frontend:latest` with your actual image paths.

4.  **Create Kubernetes Secrets:**

    - **Encode Secrets:** Base64 encode all values needed in `k8s/secrets.yaml`.
      ```bash
      echo -n "your_password" | base64
      # For GCS key file (if using):
      cat path/to/your-gcs-key.json | base64 | tr -d '\n' # Ensure no newlines in output
      ```
    - **Update `k8s/secrets.yaml`:** Paste the base64 encoded values into the `data` section.
    - **Apply Secrets:**
      ```bash
      kubectl apply -f k8s/namespace.yaml
      kubectl apply -f k8s/secrets.yaml -n forfarm
      ```
      Alternatively, create secrets imperatively (safer as values aren't stored in YAML):
      ```bash
      kubectl create secret generic forfarm-secrets -n forfarm \
        --from-literal=POSTGRES_PASSWORD='your_db_password' \
        --from-literal=RABBITMQ_PASSWORD='your_rabbit_password' \
        # ... add other secrets ...
        # If using key file:
        # --from-file=GCS_SERVICE_ACCOUNT_KEY_JSON=/path/to/your-gcs-key.json
      ```

5.  **Create ConfigMap:**

    - **Update `k8s/configmap.yaml`:** Replace placeholders like `YOUR_GOOGLE_CLIENT_ID`, `YOUR_GOOGLE_MAPS_API_KEY`, `YOUR_GCS_BUCKET_NAME`. Adjust service URLs if needed.
    - **Apply ConfigMap:**
      ```bash
      kubectl apply -f k8s/configmap.yaml -n forfarm
      ```

6.  **Apply Deployments, Services, PVCs:**

    ```bash
    # Apply database and message queue first
    kubectl apply -f k8s/postgres-pvc.yaml -n forfarm # Only if using self-hosted postgres
    kubectl apply -f k8s/postgres-deployment.yaml -n forfarm
    kubectl apply -f k8s/postgres-service.yaml -n forfarm
    kubectl apply -f k8s/rabbitmq-pvc.yaml -n forfarm
    kubectl apply -f k8s/rabbitmq-deployment.yaml -n forfarm
    kubectl apply -f k8s/rabbitmq-service.yaml -n forfarm

    # Wait for DB and RabbitMQ to be ready (check pods: kubectl get pods -n forfarm -w)

    # Apply backend and frontend
    kubectl apply -f k8s/backend-deployment.yaml -n forfarm
    kubectl apply -f k8s/backend-service.yaml -n forfarm
    kubectl apply -f k8s/frontend-deployment.yaml -n forfarm
    kubectl apply -f k8s/frontend-service.yaml -n forfarm
    ```

    _Note: The `initContainer` in `backend-deployment.yaml` should handle migrations._

7.  **Setup Ingress:**

    - **Update `k8s/ingress.yaml`:** Replace `your-domain.com` with your domain. Configure TLS and managed certificates if needed (requires creating a `ManagedCertificate` resource in GKE).
    - **Apply Ingress:**
      ```bash
      kubectl apply -f k8s/ingress.yaml -n forfarm
      ```
    - **Get Ingress IP:** Wait a few minutes, then run `kubectl get ingress forfarm-ingress -n forfarm`. Note the `ADDRESS`.
    - **Configure DNS:** Point your domain's A record(s) to the Ingress IP address.

8.  **Alternative: Cloud SQL:** Instead of running Postgres in K8s, consider using Cloud SQL. Create a Cloud SQL instance, configure its user/database, and update the `DATABASE_URL` in your `k8s/configmap.yaml` to point to the Cloud SQL proxy or private IP. You won't need the `postgres-*.yaml` files.

## Troubleshooting

- **Docker Compose:** Use `docker compose logs -f <service_name>` to check logs. Use `docker compose exec <service_name> sh` to get a shell inside a container.
- **Kubernetes:** Use `kubectl get pods -n forfarm`, `kubectl logs <pod_name> -n forfarm [-c <container_name>]`, `kubectl describe pod <pod_name> -n forfarm`.
- **Migrations:** Check the `goose_db_version` table in your database to see applied migrations.
