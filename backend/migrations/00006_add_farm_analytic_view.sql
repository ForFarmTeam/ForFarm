-- +goose Up
-- Drop the existing materialized view
DROP MATERIALIZED VIEW IF EXISTS public.farm_analytics_view;

-- Create a new materialized view that matches the GetFarmAnalytics function
CREATE MATERIALIZED VIEW public.farm_analytics_view AS
SELECT 
    f.uuid AS farm_id,
    f.name AS farm_name,
    f.owner_id,
    COALESCE(MAX(ae.created_at), f.updated_at) AS last_updated,
    
    -- Weather data aggregation
    (
        SELECT jsonb_build_object(
            'temperature', AVG((ae_w.event_data->>'temperature')::float) FILTER (WHERE ae_w.event_data ? 'temperature'),
            'humidity', AVG((ae_w.event_data->>'humidity')::float) FILTER (WHERE ae_w.event_data ? 'humidity'),
            'forecast', jsonb_agg(ae_w.event_data->'forecast') FILTER (WHERE ae_w.event_data ? 'forecast')
        )
        FROM analytics_events ae_w
        WHERE ae_w.farm_id = f.uuid AND ae_w.event_type = 'weather.updated'
        GROUP BY ae_w.farm_id
    ) AS weather_data,
    
    -- Inventory data aggregation
    (
        SELECT jsonb_build_object(
            'items', COALESCE(jsonb_agg(ae_i.event_data->'items'), '[]'::jsonb),
            'last_updated', MAX(ae_i.created_at)
        )
        FROM analytics_events ae_i
        WHERE ae_i.farm_id = f.uuid AND ae_i.event_type = 'inventory.updated'
        GROUP BY ae_i.farm_id
    ) AS inventory_data,
    
    -- Plant health data aggregation
    (
        SELECT jsonb_build_object(
            'status', MAX(ae_p.event_data->>'status'),
            'issues', COALESCE(jsonb_agg(ae_p.event_data->'issues') FILTER (WHERE ae_p.event_data ? 'issues'), '[]'::jsonb)
        )
        FROM analytics_events ae_p
        WHERE ae_p.farm_id = f.uuid AND ae_p.event_type = 'plant_health.updated'
        GROUP BY ae_p.farm_id
    ) AS plant_health_data,
    
    -- Financial data aggregation
    (
        SELECT jsonb_build_object(
            'revenue', SUM((ae_f.event_data->>'revenue')::float) FILTER (WHERE ae_f.event_data ? 'revenue'),
            'expenses', SUM((ae_f.event_data->>'expenses')::float) FILTER (WHERE ae_f.event_data ? 'expenses'),
            'profit', SUM((ae_f.event_data->>'profit')::float) FILTER (WHERE ae_f.event_data ? 'profit')
        )
        FROM analytics_events ae_f
        WHERE ae_f.farm_id = f.uuid AND ae_f.event_type = 'financial.updated'
        GROUP BY ae_f.farm_id
    ) AS financial_data,
    
    -- Production data aggregation
    (
        SELECT jsonb_build_object(
            'yield', SUM((ae_pr.event_data->>'yield')::float) FILTER (WHERE ae_pr.event_data ? 'yield'),
            'forecast', MAX(ae_pr.event_data->'forecast')
        )
        FROM analytics_events ae_pr
        WHERE ae_pr.farm_id = f.uuid AND ae_pr.event_type = 'production.updated'
        GROUP BY ae_pr.farm_id
    ) AS production_data
    
FROM 
    public.farms f
LEFT JOIN 
    public.analytics_events ae ON f.uuid = ae.farm_id
GROUP BY 
    f.uuid, f.name, f.owner_id;

-- Create indexes for faster queries
CREATE UNIQUE INDEX idx_farm_analytics_view_farm_id ON public.farm_analytics_view(farm_id);
CREATE INDEX idx_farm_analytics_view_owner_id ON public.farm_analytics_view(owner_id);

-- +goose Down
-- Drop the new materialized view
DROP MATERIALIZED VIEW IF EXISTS public.farm_analytics_view;

-- Restore the original materialized view
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

-- Recreate indexes
CREATE UNIQUE INDEX idx_farm_analytics_view_farm_id ON public.farm_analytics_view(farm_id);
CREATE INDEX idx_farm_analytics_view_owner_id ON public.farm_analytics_view(owner_id);