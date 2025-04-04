-- +goose Up
CREATE TABLE inventory_status (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
