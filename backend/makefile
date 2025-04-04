.PHONY: live run migrate

live:
	air -c .air.toml

run:
	go run cmd/forfarm/main.go API

migrate:
	go run cmd/forfarm/main.go migrate

rollback:
	go run cmd/forfarm/main.go rollback $(VERSION)