-- +goose Up

DROP MATERIALIZED VIEW IF EXISTS public.farm_analytics_view CASCADE;
DROP FUNCTION IF EXISTS public.refresh_farm_analytics_view() CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.crop_analytics_view CASCADE;
DROP FUNCTION IF EXISTS public.refresh_crop_analytics_view() CASCADE;

CREATE TABLE public.farm_analytics (
    farm_id UUID PRIMARY KEY NOT NULL,
    farm_name TEXT NOT NULL,
    owner_id UUID NOT NULL,
    farm_type TEXT,
    total_size TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,

    weather_temp_celsius DOUBLE PRECISION,
    weather_humidity DOUBLE PRECISION,
    weather_description TEXT,
    weather_icon TEXT,
    weather_wind_speed DOUBLE PRECISION,
    weather_rain_1h DOUBLE PRECISION,
    weather_observed_at TIMESTAMPTZ, -- Timestamp from the weather data itself
    weather_last_updated TIMESTAMPTZ, -- Timestamp when weather was last fetched/updated in this record

    inventory_total_items INT DEFAULT 0 NOT NULL,
    inventory_low_stock_count INT DEFAULT 0 NOT NULL,
    inventory_last_updated TIMESTAMPTZ,

    crop_total_count INT DEFAULT 0 NOT NULL,
    crop_growing_count INT DEFAULT 0 NOT NULL, -- Example: specific status count
    crop_last_updated TIMESTAMPTZ,

    overall_status TEXT, -- e.g., 'ok', 'warning', 'critical' - Can be updated by various events

    analytics_last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When this specific analytics record was last touched

    CONSTRAINT fk_farm_analytics_farm FOREIGN KEY (farm_id) REFERENCES public.farms(uuid) ON DELETE CASCADE,
    CONSTRAINT fk_farm_analytics_owner FOREIGN KEY (owner_id) REFERENCES public.users(uuid) ON DELETE CASCADE -- Assuming owner_id refers to users.uuid
);

CREATE INDEX idx_farm_analytics_owner_id ON public.farm_analytics(owner_id);
CREATE INDEX idx_farm_analytics_last_updated ON public.farm_analytics(analytics_last_updated DESC);
CREATE INDEX idx_farm_analytics_weather_last_updated ON public.farm_analytics(weather_last_updated DESC);

-- Optional: Initial data population (run once after table creation if needed)
-- INSERT INTO public.farm_analytics (farm_id, farm_name, owner_id, farm_type, total_size, latitude, longitude, analytics_last_updated)
-- SELECT uuid, name, owner_id, farm_type, total_size, lat, lon, updated_at
-- FROM public.farms
-- ON CONFLICT (farm_id) DO NOTHING;


-- +goose Down

DROP TABLE IF EXISTS public.farm_analytics;

CREATE MATERIALIZED VIEW public.farm_analytics_view AS
SELECT
    f.uuid AS farm_id,
    f.name AS farm_name,
    f.owner_id,
    f.farm_type,
    f.total_size,
    COALESCE(
        (SELECT MAX(ae_max.created_at) FROM public.analytics_events ae_max WHERE ae_max.farm_id = f.uuid),
        f.updated_at
    ) AS last_updated,
    (
        SELECT jsonb_build_object(
            'last_updated', latest_weather.created_at,
            'temperature', (latest_weather.event_data->>'temperature')::float,
            'humidity', (latest_weather.event_data->>'humidity')::float,
            'rainfall', (latest_weather.event_data->>'rainfall')::float,
            'wind_speed', (latest_weather.event_data->>'wind_speed')::float,
            'weather_status', latest_weather.event_data->>'weather_status',
            'alert_level', latest_weather.event_data->>'alert_level',
            'forecast_summary', latest_weather.event_data->>'forecast_summary'
        )
        FROM (
            SELECT ae_w.event_data, ae_w.created_at
            FROM public.analytics_events ae_w
            WHERE ae_w.farm_id = f.uuid AND ae_w.event_type = 'weather.updated'
            ORDER BY ae_w.created_at DESC
            LIMIT 1
        ) AS latest_weather
    ) AS weather_data,
    (
        SELECT jsonb_build_object(
            'items', COALESCE(jsonb_agg(ae_i.event_data->'items' ORDER BY (ae_i.event_data->>'timestamp') DESC) FILTER (WHERE ae_i.event_data ? 'items'), '[]'::jsonb),
            'last_updated', MAX(ae_i.created_at)
        )
        FROM analytics_events ae_i
        WHERE ae_i.farm_id = f.uuid AND ae_i.event_type = 'inventory.updated'
    ) AS inventory_data,
    (
        SELECT jsonb_build_object(
            'status', MAX(ae_p.event_data->>'status'),
            'issues', COALESCE(jsonb_agg(ae_p.event_data->'issues') FILTER (WHERE ae_p.event_data ? 'issues'), '[]'::jsonb),
            'last_updated', MAX(ae_p.created_at)
        )
        FROM analytics_events ae_p
        WHERE ae_p.farm_id = f.uuid AND ae_p.event_type = 'plant_health.updated'
    ) AS plant_health_data,
    (
        SELECT jsonb_build_object(
            'yield_total', SUM((ae_pr.event_data->>'yield')::float) FILTER (WHERE ae_pr.event_data ? 'yield'),
            'forecast_latest', MAX(ae_pr.event_data->>'forecast') FILTER (WHERE ae_pr.event_data ? 'forecast'),
            'last_updated', MAX(ae_pr.created_at)
        )
        FROM analytics_events ae_pr
        WHERE ae_pr.farm_id = f.uuid AND ae_pr.event_type = 'production.updated'
    ) AS production_data
FROM
    public.farms f;

CREATE UNIQUE INDEX idx_farm_analytics_view_farm_id ON public.farm_analytics_view(farm_id);
CREATE INDEX idx_farm_analytics_view_owner_id ON public.farm_analytics_view(owner_id);

-- +goose StatementBegin
CREATE OR REPLACE FUNCTION public.refresh_farm_analytics_view()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.farm_analytics_view;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

CREATE TRIGGER refresh_farm_analytics_view_trigger_events
AFTER INSERT ON public.analytics_events -- Adjust if original trigger was different
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_farm_analytics_view();

CREATE TRIGGER refresh_farm_analytics_view_trigger_farms
AFTER INSERT OR UPDATE OR DELETE ON public.farms -- Adjust if original trigger was different
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_farm_analytics_view();

CREATE MATERIALIZED VIEW public.crop_analytics_view AS
SELECT
    c.uuid AS crop_id, c.name AS crop_name, c.farm_id, p.name AS plant_name, p.variety AS variety,
    c.status AS current_status, c.growth_stage, c.land_size, c.geo_feature, c.updated_at AS last_updated
FROM public.croplands c JOIN public.plants p ON c.plant_id = p.uuid;
CREATE UNIQUE INDEX idx_crop_analytics_view_crop_id ON public.crop_analytics_view(crop_id);
CREATE INDEX idx_crop_analytics_view_farm_id ON public.crop_analytics_view(farm_id);
CREATE INDEX idx_crop_analytics_view_plant_name ON public.crop_analytics_view(plant_name);
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION public.refresh_crop_analytics_view()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.crop_analytics_view;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd
CREATE TRIGGER refresh_crop_analytics_trigger_croplands
AFTER INSERT OR UPDATE OR DELETE ON public.croplands FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_crop_analytics_view();
CREATE TRIGGER refresh_crop_analytics_trigger_plants
AFTER INSERT OR UPDATE OR DELETE ON public.plants FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_crop_analytics_view();