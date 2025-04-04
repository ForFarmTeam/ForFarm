-- +goose Up
-- Description: Updates the farm_analytics_view (Version 3) to remove financial data
--              and fetch the *latest* weather data instead of aggregating.

-- Drop the existing view (from migration 00009)
DROP MATERIALIZED VIEW IF EXISTS public.farm_analytics_view;

-- Recreate the materialized view with updated logic
CREATE MATERIALIZED VIEW public.farm_analytics_view AS
SELECT
    f.uuid AS farm_id,
    f.name AS farm_name,
    f.owner_id,
    f.farm_type,
    f.total_size,
    -- Determine last update time based on farm update or latest event
    COALESCE(
        (SELECT MAX(ae_max.created_at) FROM public.analytics_events ae_max WHERE ae_max.farm_id = f.uuid),
        f.updated_at
    ) AS last_updated,

    -- Weather data: Select the *latest* 'weather.updated' event data for the farm
    (
        SELECT jsonb_build_object(
            'last_updated', latest_weather.created_at, -- Use the event timestamp
            'temperature', (latest_weather.event_data->>'temperature')::float,
            'humidity', (latest_weather.event_data->>'humidity')::float,
            'rainfall', (latest_weather.event_data->>'rainfall')::float, -- Assuming 'rainfall' exists
            'wind_speed', (latest_weather.event_data->>'wind_speed')::float,
            'weather_status', latest_weather.event_data->>'weather_status', -- Assuming 'weather_status' exists
            'alert_level', latest_weather.event_data->>'alert_level',       -- Assuming 'alert_level' exists
            'forecast_summary', latest_weather.event_data->>'forecast_summary' -- Assuming 'forecast_summary' exists
            -- Add more fields here, ensuring they exist in your 'weather.updated' event_data JSON
        )
        FROM (
            -- Find the most recent weather event for this farm
            SELECT ae_w.event_data, ae_w.created_at
            FROM public.analytics_events ae_w
            WHERE ae_w.farm_id = f.uuid AND ae_w.event_type = 'weather.updated' -- Make sure event_type is correct
            ORDER BY ae_w.created_at DESC
            LIMIT 1
        ) AS latest_weather
    ) AS weather_data, -- This will be NULL if no 'weather.updated' event exists for the farm

    -- Inventory data aggregation (Keep logic from V2 or refine)
    (
        SELECT jsonb_build_object(
            'items', COALESCE(jsonb_agg(ae_i.event_data->'items' ORDER BY (ae_i.event_data->>'timestamp') DESC) FILTER (WHERE ae_i.event_data ? 'items'), '[]'::jsonb),
            'last_updated', MAX(ae_i.created_at)
        )
        FROM analytics_events ae_i
        WHERE ae_i.farm_id = f.uuid AND ae_i.event_type = 'inventory.updated' -- Ensure event type is correct
    ) AS inventory_data,

    -- Plant health data aggregation (Keep logic from V2 or refine)
    (
        SELECT jsonb_build_object(
            'status', MAX(ae_p.event_data->>'status'),
            'issues', COALESCE(jsonb_agg(ae_p.event_data->'issues') FILTER (WHERE ae_p.event_data ? 'issues'), '[]'::jsonb),
            'last_updated', MAX(ae_p.created_at)
        )
        FROM analytics_events ae_p
        WHERE ae_p.farm_id = f.uuid AND ae_p.event_type = 'plant_health.updated' -- Ensure event type is correct
    ) AS plant_health_data,

    -- Financial data aggregation -- REMOVED --

    -- Production data aggregation (Keep logic from V2 or refine)
    (
        SELECT jsonb_build_object(
            'yield_total', SUM((ae_pr.event_data->>'yield')::float) FILTER (WHERE ae_pr.event_data ? 'yield'),
            'forecast_latest', MAX(ae_pr.event_data->>'forecast') FILTER (WHERE ae_pr.event_data ? 'forecast'),
            'last_updated', MAX(ae_pr.created_at)
        )
        FROM analytics_events ae_pr
        WHERE ae_pr.farm_id = f.uuid AND ae_pr.event_type = 'production.updated' -- Ensure event type is correct
    ) AS production_data

FROM
    public.farms f;

-- Recreate indexes for faster queries on the new view structure
CREATE UNIQUE INDEX idx_farm_analytics_view_farm_id ON public.farm_analytics_view(farm_id);
CREATE INDEX idx_farm_analytics_view_owner_id ON public.farm_analytics_view(owner_id);

-- The refresh function and triggers from migration 00005 should still work.

-- +goose Down
-- Revert to the previous version (from migration 00009)
-- Drop the modified view
DROP MATERIALIZED VIEW IF EXISTS public.farm_analytics_view;

-- Recreate the view from migration 00009 (including financial data and aggregated weather)
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
            'temperature_avg', AVG((ae_w.event_data->>'temperature')::float) FILTER (WHERE ae_w.event_data ? 'temperature'),
            'humidity_avg', AVG((ae_w.event_data->>'humidity')::float) FILTER (WHERE ae_w.event_data ? 'humidity'),
            'forecasts', jsonb_agg(ae_w.event_data->'forecast') FILTER (WHERE ae_w.event_data ? 'forecast')
        )
        FROM analytics_events ae_w
        WHERE ae_w.farm_id = f.uuid AND ae_w.event_type = 'weather.updated'
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
            'revenue', SUM((ae_f.event_data->>'revenue')::float) FILTER (WHERE ae_f.event_data ? 'revenue'),
            'expenses', SUM((ae_f.event_data->>'expenses')::float) FILTER (WHERE ae_f.event_data ? 'expenses'),
            'profit', SUM((ae_f.event_data->>'profit')::float) FILTER (WHERE ae_f.event_data ? 'profit'),
            'last_updated', MAX(ae_f.created_at)
        )
        FROM analytics_events ae_f
        WHERE ae_f.farm_id = f.uuid AND ae_f.event_type = 'financial.updated'
    ) AS financial_data,
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

-- Recreate indexes for the V2 view structure
CREATE UNIQUE INDEX idx_farm_analytics_view_farm_id ON public.farm_analytics_view(farm_id);
CREATE INDEX idx_farm_analytics_view_owner_id ON public.farm_analytics_view(owner_id);

-- The refresh function and triggers from 00005 are assumed to still exist.