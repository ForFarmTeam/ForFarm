FROM golang:1.23.6-alpine3.21

WORKDIR /app

RUN apk update && apk add --no-cache curl

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . .

EXPOSE 8000

CMD ["air", "-c", ".air.toml"]