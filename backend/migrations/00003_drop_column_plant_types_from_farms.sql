-- +goose Up
-- This column was initially created in 00002 but deemed unnecessary.
ALTER TABLE farms DROP COLUMN IF EXISTS plant_types; -- Use IF EXISTS for safety

-- +goose Down
-- Add the column back if rolling back.
ALTER TABLE farms
    ADD COLUMN plant_types UUID[];