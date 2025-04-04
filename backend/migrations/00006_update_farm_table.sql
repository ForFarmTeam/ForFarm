-- +goose Up
-- Add new columns for farm details
ALTER TABLE farms
    ADD COLUMN farm_type TEXT,
    ADD COLUMN total_size TEXT; -- Consider NUMERIC or DOUBLE PRECISION if it's always a number

-- Change lat/lon from array to single value
-- Assumes the first element of the array was the intended value
ALTER TABLE farms
    ALTER COLUMN lat TYPE DOUBLE PRECISION USING lat[1],
    ALTER COLUMN lon TYPE DOUBLE PRECISION USING lon[1];

-- Note: The farm_analytics_view created in 00005 does not yet include these new columns.
-- Subsequent migrations will update the view.

-- +goose Down
-- Revert lat/lon change
ALTER TABLE farms
    ALTER COLUMN lat TYPE DOUBLE PRECISION[] USING ARRAY[lat],
    ALTER COLUMN lon TYPE DOUBLE PRECISION[] USING ARRAY[lon];

-- Remove added columns
ALTER TABLE farms
    DROP COLUMN IF EXISTS farm_type,
    DROP COLUMN IF EXISTS total_size;