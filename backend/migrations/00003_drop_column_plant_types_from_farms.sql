-- +goose Up
ALTER TABLE farms DROP COLUMN plant_types;

-- +goose Down
ALTER TABLE farms
    ADD COLUMN plant_types UUID[];