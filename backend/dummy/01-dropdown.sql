-- Insert data into categorical tables (Idempotent using ON CONFLICT)

-- Light Profiles
INSERT INTO light_profiles (name) VALUES
('Full Sun'),
('Partial Shade'),
('Full Shade')
ON CONFLICT (name) DO NOTHING;

-- Soil Conditions
INSERT INTO soil_conditions (name) VALUES
('Well-drained'),
('Loamy'),
('Sandy'),
('Clay'),
('Moist'),
('Slightly Acidic'),
('Neutral pH')
ON CONFLICT (name) DO NOTHING;

-- Harvest Units (Used by Plants and Inventory)
INSERT INTO harvest_units (name) VALUES
('kg'),
('tonne'),
('Piece(s)'),
('Bag(s)'),
('Box(es)'),
('Liter(s)'),
('Gallon(s)'),
('meter(s)'),
('hour(s)')
ON CONFLICT (name) DO NOTHING;

-- Inventory Categories (from migration 00013)
INSERT INTO inventory_category (name) VALUES
('Seeds'),
('Fertilizers'),
('Pesticides'),
('Herbicides'),
('Tools'),
('Equipment'),
('Fuel'),
('Harvested Goods'),
('Other')
ON CONFLICT (name) DO NOTHING;

-- Inventory Statuses (from migration 00007)
INSERT INTO inventory_status (name) VALUES
('In Stock'),
('Low Stock'),
('Out of Stock'),
('Expired'),
('Reserved')
ON CONFLICT (name) DO NOTHING;


-- Insert sample Plant data
-- Plant 1: Tomato
INSERT INTO plants (
    uuid, name, variety, row_spacing, optimal_temp, planting_depth, average_height,
    light_profile_id, soil_condition_id, planting_detail, is_perennial, days_to_emerge,
    days_to_flower, days_to_maturity, harvest_window, ph_value, estimate_loss_rate,
    estimate_revenue_per_hu, harvest_unit_id, water_needs
) VALUES (
    gen_random_uuid(), 'Tomato', 'Roma', 0.6, 24.0, 0.01, 1.5,
    (SELECT id FROM light_profiles WHERE name = 'Full Sun'),
    (SELECT id FROM soil_conditions WHERE name = 'Well-drained'),
    'Start seeds indoors 6-8 weeks before last frost. Transplant when seedlings have 2-3 true leaves.',
    FALSE, 7, 30, 75, 14, 6.5, 0.10, 2.5,
    (SELECT id FROM harvest_units WHERE name = 'kg'), 25.0 -- mm per week
)
ON CONFLICT (uuid) DO NOTHING; -- Added conflict handling for UUID just in case

-- Plant 2: Corn
INSERT INTO plants (
    uuid, name, variety, row_spacing, optimal_temp, planting_depth, average_height,
    light_profile_id, soil_condition_id, planting_detail, is_perennial, days_to_emerge,
    days_to_flower, days_to_maturity, harvest_window, ph_value, estimate_loss_rate,
    estimate_revenue_per_hu, harvest_unit_id, water_needs
) VALUES (
    gen_random_uuid(), 'Corn', 'Sweet Corn (Golden Bantam)', 0.75, 26.0, 0.05, 2.5,
    (SELECT id FROM light_profiles WHERE name = 'Full Sun'),
    (SELECT id FROM soil_conditions WHERE name = 'Loamy'),
    'Plant seeds directly outdoors after the last frost when soil temperature is above 15°C. Plant in blocks for pollination.',
    FALSE, 10, 60, 90, 10, 6.2, 0.15, 0.8,
    (SELECT id FROM harvest_units WHERE name = 'kg'), 30.0 -- mm per week
)
ON CONFLICT (uuid) DO NOTHING;


-- Insert dummy Farm data for the specified user
-- Farm 1
INSERT INTO farms (
    uuid, name, lat, lon, created_at, updated_at, owner_id, farm_type, total_size
) VALUES (
    gen_random_uuid(),
    'Sunny Meadow Farm',
    13.8476, -- Example Latitude (Single value)
    100.5696, -- Example Longitude (Single value)
    NOW(),
    NOW(),
    '19fb4b7f-3017-41d1-a500-97ce9879ce78', -- Provided User UUID
    'Vegetable Farm',
    '10 Hectares'
)
ON CONFLICT (uuid) DO NOTHING;

-- Farm 2
INSERT INTO farms (
    uuid, name, lat, lon, created_at, updated_at, owner_id, farm_type, total_size
) VALUES (
    gen_random_uuid(),
    'Green Valley Crops',
    13.7563, -- Example Latitude
    100.5018, -- Example Longitude
    NOW(),
    NOW(),
    '19fb4b7f-3017-41d1-a500-97ce9879ce78', -- Provided User UUID
    'Mixed Crop Farm',
    '25 Hectares'
)
ON CONFLICT (uuid) DO NOTHING;


-- Insert dummy Cropland data (one for each farm)
-- Cropland for Farm 1 (Sunny Meadow Farm) - Planting Tomatoes
INSERT INTO croplands (
    uuid, name, status, priority, land_size, growth_stage, plant_id, farm_id, created_at, updated_at, geo_feature
) VALUES (
    gen_random_uuid(),
    'Tomato Patch A',
    'Active',
    1,
    1.5, -- Hectares
    'Flowering',
    (SELECT uuid FROM plants WHERE name = 'Tomato' AND variety = 'Roma'), -- Get Tomato Plant UUID
    (SELECT uuid FROM farms WHERE name = 'Sunny Meadow Farm'), -- Get Farm 1 UUID
    NOW(),
    NOW(),
    '{"type": "polygon", "path": [{"lat": 13.8470, "lng": 100.5690}, {"lat": 13.8480, "lng": 100.5690}, {"lat": 13.8480, "lng": 100.5700}, {"lat": 13.8470, "lng": 100.5700}]}'::jsonb
)
ON CONFLICT (uuid) DO NOTHING;

-- Cropland for Farm 2 (Green Valley Crops) - Planting Corn
INSERT INTO croplands (
    uuid, name, status, priority, land_size, growth_stage, plant_id, farm_id, created_at, updated_at, geo_feature
) VALUES (
    gen_random_uuid(),
    'Corn Field East',
    'Planting',
    2,
    5.0, -- Hectares
    'Seedling',
    (SELECT uuid FROM plants WHERE name = 'Corn' AND variety = 'Sweet Corn (Golden Bantam)'), -- Get Corn Plant UUID
    (SELECT uuid FROM farms WHERE name = 'Green Valley Crops'), -- Get Farm 2 UUID
    NOW(),
    NOW(),
    '{"type": "marker", "position": {"lat": 13.7563, "lng": 100.5018}}'::jsonb
)
ON CONFLICT (uuid) DO NOTHING;