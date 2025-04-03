-- +goose Up
-- Description: Creates a materialized view for crop-level analytics,
--              pulling data directly from croplands and plants tables.

CREATE MATERIALIZED VIEW public.crop_analytics_view AS
SELECT
    c.uuid AS crop_id,
    c.name AS crop_name,
    c.farm_id,
    p.name AS plant_name,
    p.variety AS variety, -- Include variety from plants table
    c.status AS current_status,
    c.growth_stage,
    c.land_size,
    c.geo_feature, -- Include geo_feature added in 00010
    c.updated_at AS last_updated -- Use cropland's updated_at as the primary refresh indicator
    -- Add columns here if CropAnalytics struct includes more fields derived directly
    -- from croplands or plants tables. Event-derived data would need different handling.
FROM
    public.croplands c
JOIN
    public.plants p ON c.plant_id = p.uuid;

-- Create indexes for efficient querying
CREATE UNIQUE INDEX idx_crop_analytics_view_crop_id ON public.crop_analytics_view(crop_id);
CREATE INDEX idx_crop_analytics_view_farm_id ON public.crop_analytics_view(farm_id);
CREATE INDEX idx_crop_analytics_view_plant_name ON public.crop_analytics_view(plant_name); -- Added index

-- Create a dedicated function to refresh this new view
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION public.refresh_crop_analytics_view()
RETURNS TRIGGER AS $$
BEGIN
    -- Use CONCURRENTLY to avoid locking the view during refresh
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.crop_analytics_view;
    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- Create triggers to refresh the view when underlying data changes
-- Trigger on Croplands table changes
CREATE TRIGGER refresh_crop_analytics_trigger_croplands
AFTER INSERT OR UPDATE OR DELETE ON public.croplands
FOR EACH STATEMENT -- Refresh once per statement that modifies the table
EXECUTE FUNCTION public.refresh_crop_analytics_view();

-- Trigger on Plants table changes (e.g., if plant name/variety is updated)
CREATE TRIGGER refresh_crop_analytics_trigger_plants
AFTER INSERT OR UPDATE OR DELETE ON public.plants
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_crop_analytics_view();


-- +goose Down
-- Drop triggers first
DROP TRIGGER IF EXISTS refresh_crop_analytics_trigger_croplands ON public.croplands;
DROP TRIGGER IF EXISTS refresh_crop_analytics_trigger_plants ON public.plants;

-- Drop the refresh function
DROP FUNCTION IF EXISTS public.refresh_crop_analytics_view();

-- Drop the materialized view and its indexes
DROP MATERIALIZED VIEW IF EXISTS public.crop_analytics_view; -- Indexes are dropped automatically