-- +goose Up
-- Description: Recreates farm_analytics_view (Version 2) to include aggregated data
--              from analytics_events and new columns from the farms table.

-- Drop the existing materialized view (from migration 00005)
DROP MATERIALIZED VIEW IF EXISTS public.farm_analytics_view;

-- Recreate the materialized view with aggregated data
CREATE MATERIALIZED VIEW public.farm_analytics_view AS
SELECT
    f.uuid AS farm_id,
    f.name AS farm_name,
    f.owner_id,
    f.farm_type, -- Added in 00006
    f.total_size, -- Added in 00006
    -- Determine last update time based on farm update or latest event
    COALESCE(
        (SELECT MAX(ae_max.created_at) FROM public.analytics_events ae_max WHERE ae_max.farm_id = f.uuid),
        f.updated_at
    ) AS last_updated,

    -- Weather data aggregation (Example: Average Temp/Humidity, Forecast List)
    (
        SELECT jsonb_build_object(
            'temperature_avg', AVG((ae_w.event_data->>'temperature')::float) FILTER (WHERE ae_w.event_data ? 'temperature'),
            'humidity_avg', AVG((ae_w.event_data->>'humidity')::float) FILTER (WHERE ae_w.event_data ? 'humidity'),
            'forecasts', jsonb_agg(ae_w.event_data->'forecast') FILTER (WHERE ae_w.event_data ? 'forecast')
        )
        FROM analytics_events ae_w
        WHERE ae_w.farm_id = f.uuid AND ae_w.event_type = 'weather.updated' -- Ensure event type is correct
        -- GROUP BY ae_w.farm_id -- Not needed inside subquery selecting for one farm
    ) AS weather_data,

    -- Inventory data aggregation (Example: Item List, Last Update)
    (
        SELECT jsonb_build_object(
            'items', COALESCE(jsonb_agg(ae_i.event_data->'items' ORDER BY (ae_i.event_data->>'timestamp') DESC) FILTER (WHERE ae_i.event_data ? 'items'), '[]'::jsonb),
            'last_updated', MAX(ae_i.created_at)
        )
        FROM analytics_events ae_i
        WHERE ae_i.farm_id = f.uuid AND ae_i.event_type = 'inventory.updated' -- Ensure event type is correct
        -- GROUP BY ae_i.farm_id
    ) AS inventory_data,

    -- Plant health data aggregation (Example: Latest Status, Issues List)
    (
        SELECT jsonb_build_object(
            'status', MAX(ae_p.event_data->>'status'), -- MAX works on text, gets latest alphabetically if not timestamped
            'issues', COALESCE(jsonb_agg(ae_p.event_data->'issues') FILTER (WHERE ae_p.event_data ? 'issues'), '[]'::jsonb)
            -- Consider adding 'last_updated': MAX(ae_p.created_at)
        )
        FROM analytics_events ae_p
        WHERE ae_p.farm_id = f.uuid AND ae_p.event_type = 'plant_health.updated' -- Ensure event type is correct
        -- GROUP BY ae_p.farm_id
    ) AS plant_health_data,

    -- Financial data aggregation (Example: Sums)
    (
        SELECT jsonb_build_object(
            'revenue', SUM((ae_f.event_data->>'revenue')::float) FILTER (WHERE ae_f.event_data ? 'revenue'),
            'expenses', SUM((ae_f.event_data->>'expenses')::float) FILTER (WHERE ae_f.event_data ? 'expenses'),
            'profit', SUM((ae_f.event_data->>'profit')::float) FILTER (WHERE ae_f.event_data ? 'profit')
            -- Consider adding 'last_updated': MAX(ae_f.created_at)
        )
        FROM analytics_events ae_f
        WHERE ae_f.farm_id = f.uuid AND ae_f.event_type = 'financial.updated' -- Ensure event type is correct
        -- GROUP BY ae_f.farm_id
    ) AS financial_data,

    -- Production data aggregation (Example: Sum Yield, Latest Forecast)
    (
        SELECT jsonb_build_object(
            'yield_total', SUM((ae_pr.event_data->>'yield')::float) FILTER (WHERE ae_pr.event_data ? 'yield'),
            'forecast_latest', MAX(ae_pr.event_data->>'forecast') FILTER (WHERE ae_pr.event_data ? 'forecast') -- MAX on text
            -- Consider adding 'last_updated': MAX(ae_pr.created_at)
        )
        FROM analytics_events ae_pr
        WHERE ae_pr.farm_id = f.uuid AND ae_pr.event_type = 'production.updated' -- Ensure event type is correct
        -- GROUP BY ae_pr.farm_id
    ) AS production_data

FROM
    public.farms f; -- No need for LEFT JOIN and GROUP BY on the main query for this structure

-- Recreate indexes for faster queries on the new view structure
CREATE UNIQUE INDEX idx_farm_analytics_view_farm_id ON public.farm_analytics_view(farm_id);
CREATE INDEX idx_farm_analytics_view_owner_id ON public.farm_analytics_view(owner_id);

-- The refresh function and triggers from migration 00005 should still work
-- as they target the view by name ('public.farm_analytics_view').

-- +goose Down
-- Drop the recreated materialized view
DROP MATERIALIZED VIEW IF EXISTS public.farm_analytics_view;

-- Restore the original simple materialized view (from migration 00005)
CREATE MATERIALIZED VIEW public.farm_analytics_view AS
SELECT
    f.uuid AS farm_id,
    f.name AS farm_name,
    f.owner_id,
    -- farm_type and total_size did not exist in the view definition from 00005
    f.created_at,
    f.updated_at,
    COUNT(ae.id) AS total_events,
    MAX(ae.created_at) AS last_event_at
FROM
    public.farms f
LEFT JOIN
    public.analytics_events ae ON f.uuid = ae.farm_id
GROUP BY
    f.uuid, f.name, f.owner_id, f.created_at, f.updated_at;

-- Recreate indexes for the restored view
CREATE UNIQUE INDEX idx_farm_analytics_view_farm_id ON public.farm_analytics_view(farm_id);
CREATE INDEX idx_farm_analytics_view_owner_id ON public.farm_analytics_view(owner_id);

-- The refresh function and triggers from 00005 are assumed to still exist
-- and will target this restored view definition.