-- +goose Up
-- Create analytics_events table to store all events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id SERIAL PRIMARY KEY,
    farm_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_analytics_farm FOREIGN KEY (farm_id) REFERENCES public.farms(uuid) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_analytics_events_farm_id ON public.analytics_events(farm_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Create a simple materialized view for farm analytics
CREATE MATERIALIZED VIEW public.farm_analytics_view AS
SELECT 
    f.uuid AS farm_id,
    f.name AS farm_name,
    f.owner_id,
    f.farm_type,
    f.total_size,
    f.created_at,
    f.updated_at,
    COUNT(ae.id) AS total_events,
    MAX(ae.created_at) AS last_event_at
FROM 
    public.farms f
LEFT JOIN 
    public.analytics_events ae ON f.uuid = ae.farm_id
GROUP BY 
    f.uuid, f.name, f.owner_id, f.farm_type, f.total_size, f.created_at, f.updated_at;

-- Create index for faster queries
CREATE UNIQUE INDEX idx_farm_analytics_view_farm_id ON public.farm_analytics_view(farm_id);
CREATE INDEX idx_farm_analytics_view_owner_id ON public.farm_analytics_view(owner_id);

-- Create function to refresh the materialized view
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION public.refresh_farm_analytics_view()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.farm_analytics_view;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- Create trigger to refresh the view when new events are added
CREATE TRIGGER refresh_farm_analytics_view_trigger
AFTER INSERT ON public.analytics_events
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_farm_analytics_view();

-- Create trigger to refresh the view when farms are updated
CREATE TRIGGER refresh_farm_analytics_view_farms_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.farms
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_farm_analytics_view();

-- +goose Down
-- Drop triggers first
DROP TRIGGER IF EXISTS refresh_farm_analytics_view_trigger ON public.analytics_events;
DROP TRIGGER IF EXISTS refresh_farm_analytics_view_farms_trigger ON public.farms;

-- Drop function
-- +goose StatementBegin
DROP FUNCTION IF EXISTS public.refresh_farm_analytics_view() CASCADE;
-- +goose StatementEnd

-- Drop materialized view
DROP MATERIALIZED VIEW IF EXISTS public.farm_analytics_view CASCADE;

-- Drop table with CASCADE to ensure all dependencies are removed
DROP TABLE IF EXISTS public.analytics_events CASCADE;