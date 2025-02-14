INSERT INTO light_profiles (name)
VALUES
    ('Full Sun'),
    ('Partial Shade'),
    ('Full Shade');

INSERT INTO soil_conditions (name)
VALUES
    ('Loamy'),
    ('Sandy'),
    ('Clay'),
    ('Silty');

INSERT INTO harvest_units (name)
VALUES
    ('Kilograms'),
    ('Pounds'),
    ('Bushels'),
    ('Tons');

INSERT INTO plants (
    uuid, name, variety, row_spacing, optimal_temp, planting_depth, average_height,
    light_profile_id, soil_condition_id, planting_detail, is_perennial, days_to_emerge,
    days_to_flower, days_to_maturity, harvest_window, ph_value, estimate_loss_rate,
    estimate_revenue_per_hu, harvest_unit_id, water_needs
)
VALUES
    (
        '450e8400-e29b-41d4-a716-446655440000', -- UUID
        'Tomato',                               -- Name
        'Cherry',                               -- Variety
        0.5,                                    -- Row Spacing (meters)
        25.0,                                   -- Optimal Temperature (°C)
        0.02,                                   -- Planting Depth (meters)
        1.5,                                    -- Average Height (meters)
        1,                                      -- Light Profile ID (Full Sun)
        1,                                      -- Soil Condition ID (Loamy)
        'Plant in well-drained soil.',          -- Planting Detail
        FALSE,                                  -- Is Perennial
        7,                                      -- Days to Emerge
        60,                                     -- Days to Flower
        90,                                     -- Days to Maturity
        14,                                     -- Harvest Window (days)
        6.5,                                    -- pH Value
        0.1,                                    -- Estimate Loss Rate
        10.0,                                   -- Estimate Revenue per Harvest Unit
        1,                                      -- Harvest Unit ID (Kilograms)
        2.5                                     -- Water Needs (liters per day)
    ),
    (
        '550e8400-e29b-41d4-a716-446655440001', -- UUID
        'Corn',                                 -- Name
        'Sweet',                                -- Variety
        0.75,                                   -- Row Spacing (meters)
        30.0,                                   -- Optimal Temperature (°C)
        0.05,                                   -- Planting Depth (meters)
        2.0,                                    -- Average Height (meters)
        1,                                      -- Light Profile ID (Full Sun)
        2,                                      -- Soil Condition ID (Sandy)
        'Plant in rows with adequate spacing.', -- Planting Detail
        FALSE,                                  -- Is Perennial
        10,                                     -- Days to Emerge
        70,                                     -- Days to Flower
        100,                                    -- Days to Maturity
        21,                                     -- Harvest Window (days)
        6.0,                                    -- pH Value
        0.15,                                   -- Estimate Loss Rate
        8.0,                                    -- Estimate Revenue per Harvest Unit
        2,                                      -- Harvest Unit ID (Pounds)
        3.0                                     -- Water Needs (liters per day)
    );