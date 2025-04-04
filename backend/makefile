.PHONY: live run migrate

live:
	air -c .air.toml

run:
	go run cmd/forfarm/main.go API

migrate:
	go run cmd/forfarm/main.go migrate

rollback:
	go run cmd/forfarm/main.go rollback $(VERSION)

seed: check-db-vars
	@echo "Running database dummy data scripts from ./dummy/ ..."
	psql "postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-@Password123}@${DB_HOST:-localhost}:${DB_PORT:-5433}/${POSTGRES_DB:-postgres}?sslmode=disable" -f ./dummy/01_dropdowns.sql || exit 1
	psql "postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-@Password123}@${DB_HOST:-localhost}:${DB_PORT:-5433}/${POSTGRES_DB:-postgres}?sslmode=disable" -f ./dummy/02_plants.sql || exit 1
	psql "postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-@Password123}@${DB_HOST:-localhost}:${DB_PORT:-5433}/${POSTGRES_DB:-postgres}?sslmode=disable" -f ./dummy/03_knowledge_hub.sql || exit 1
	@echo "Database dummy data seeding complete."

check-db-vars:
ifndef POSTGRES_USER
	$(warning POSTGRES_USER environment variable is not set. Using default 'postgres'. Export it if needed.)
endif
ifndef POSTGRES_PASSWORD
	$(warning POSTGRES_PASSWORD environment variable is not set. Using default '@Password123'. Export it if needed.)
endif
ifndef POSTGRES_DB
	$(warning POSTGRES_DB environment variable is not set. Using default 'postgres'. Export it if needed.)
endif