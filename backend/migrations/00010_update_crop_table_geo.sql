-- +goose Up
-- Add a column to store geographical features (marker or polygon) for a cropland.
-- Example JSON structure:
-- {"type": "marker", "position": {"lat": 13.84, "lng": 100.48}}
-- or
-- {"type": "polygon", "path": [{"lat": 13.81, "lng": 100.40}, ...]}
ALTER TABLE croplands
ADD COLUMN geo_feature JSONB;

-- Consider adding a GIN index if querying within the JSON often
-- CREATE INDEX idx_croplands_geo_feature ON croplands USING GIN (geo_feature);

-- +goose Down
-- Remove the geo_feature column
ALTER TABLE croplands
DROP COLUMN IF EXISTS geo_feature;