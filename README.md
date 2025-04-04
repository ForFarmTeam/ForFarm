# ForFarm

A farming software designed to empower farmers and agribusinesses by AI, weather data, and analytics. ForFarm helps users make data-driven decisions, and optimize resource management through a tools.

## Features

- **Farm & Crop Management:** Define farms, map croplands (points, polygons), track crop lifecycles, status, and growth stages.
- **Inventory Tracking:** Manage farm resources like seeds, fertilizers, equipment, etc.
- **Data Analytics:** Visualize farm and crop performance metrics. (Integration with weather, soil data planned).
- **Knowledge Hub:** Access articles and guides on farming best practices.
- **AI Chatbot:** Get contextual assistance based on your farm/crop data or ask general farming questions.
- **Weather Integration:** (Implemented via Worker) Fetches current weather data for farms.
- **User Authentication:** Secure login/registration using email/password and Google OAuth.
- **Marketplace Insights:** (Mock Data) Provides simulated market price trends and analysis.

## Project Structure

The project is organized into two main components:

```
├── backend/ # Go backend application (API, business logic, data access)
│ ├── cmd/ # Main entry points (API server, CLI commands)
│ ├── internal/ # Private application code
│ │ ├── api/ # API handlers and routing (Huma framework)
│ │ ├── cache/ # Caching interface and implementations
│ │ ├── config/ # Configuration loading (Viper)
│ │ ├── domain/ # Core business entities and repository interfaces
│ │ ├── event/ # Event bus and projection logic
│ │ ├── middlewares/ # HTTP middlewares (Auth, Rate Limiting)
│ │ ├── repository/ # Data access layer implementations (Postgres)
│ │ ├── services/ # Business logic services (Chat, Weather, Analytics)
│ │ └── workers/ # Background worker processes (Weather Updater)
│ ├── migrations/ # Database schema migrations (Goose)
│ ├── scripts/ # Utility scripts (Seeding)
│ ├── .air.toml # Live reload config for backend dev
│ ├── go.mod # Go module dependencies
│ └── go.dockerfile # Dockerfile for backend
├── frontend/ # Next.js frontend application (UI)
│ ├── app/ # Next.js App Router structure (pages, layouts)
│ ├── api/ # Frontend API client functions for backend interaction
│ ├── components/ # Reusable UI components (shadcn/ui)
│ ├── context/ # React context providers (Session)
│ ├── hooks/ # Custom React hooks
│ ├── lib/ # Utility functions, providers
│ ├── schemas/ # Zod validation schemas for forms
│ ├── types.ts # TypeScript type definitions
│ ├── next.config.ts # Next.js configuration
│ └── next.dockerfile # Dockerfile for frontend
├── docker-compose.yml # Docker Compose configuration for services
├── .env.example # Example environment variables file
├── README.md # This file
└── SETUP.md # Detailed development setup guide
```

- **Backend:** Built with Go, using Chi for routing, Huma for API definition, pgx for PostgreSQL interaction, and Cobra for CLI commands. It handles business logic, data persistence, and external service integrations.
- **Frontend:** Built with Next.js (App Router) and TypeScript, using Tailwind CSS and shadcn/ui for styling and components. It provides the user interface and interacts with the backend API.

## Installation & Setup

For detailed setup instructions, please refer to the **[SETUP.md](SETUP.md)** guide.

The basic steps are:

1.  **Prerequisites:** Ensure Docker, Docker Compose, Go, Node.js, and pnpm are installed.
2.  **Clone:** Clone this repository.
3.  **Configure:** Create a `.env` file from `.env.example` and fill in necessary secrets and keys (Database, JWT, Google OAuth, Maps API, Weather API, Gemini API).
4.  **Run:** Start all services using `docker compose up --build -d`.
5.  **Migrate:** Run database migrations: `cd backend && make migrate && cd ..`.
6.  **Seed (Optional):** Populate static data: `cd backend && make seed && cd ..`.
7.  **Access:** Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

Once set up and running:

1.  Navigate to [http://localhost:3000](http://localhost:3000).
2.  Register a new account or log in.
3.  Explore the dashboard:
    - Add and manage your farms.
    - Add croplands within your farms, drawing boundaries or placing markers.
    - Manage your inventory items.
    - Consult the AI Chatbot for farming advice.
    - Browse the Knowledge Hub articles.
    - View (simulated) Marketplace data.

## Contributors

- [Natthapol Sermsaran](https://github.com/xNatthapol)
- [Sirin Puenggun](https://github.com/Sosokker/)
- [Pattadon Loyprasert](https://github.com/GGWPXXXX)
- [Buravit Yenjit](https://github.com/KikyoBRV)
