-- Insert additional Thai Native Plant data

-- Plant 3: Rice (Khao Hom Mali)
INSERT INTO plants (
    uuid, name, variety, row_spacing, optimal_temp, planting_depth, average_height,
    light_profile_id, soil_condition_id, planting_detail, is_perennial, days_to_emerge,
    days_to_flower, days_to_maturity, harvest_window, ph_value, estimate_loss_rate,
    estimate_revenue_per_hu, harvest_unit_id, water_needs
) VALUES (
    gen_random_uuid(), 'Rice', 'Khao Dawk Mali 105 (Jasmine)', 0.2, 30.0, 0.03, 1.2,
    (SELECT id FROM light_profiles WHERE name = 'Full Sun'),
    (SELECT id FROM soil_conditions WHERE name = 'Clay'), -- Often grown in flooded paddies
    'Requires flooded conditions for most of its growth cycle. Transplant seedlings into prepared paddies.',
    FALSE, 5, 60, 120, 15, 6.0, 0.18, 0.5, -- Revenue per kg (example)
    (SELECT id FROM harvest_units WHERE name = 'kg'), 1200.0 -- mm total water needed (high)
)
ON CONFLICT (uuid) DO NOTHING;

-- Plant 4: Mango (Nam Dok Mai)
INSERT INTO plants (
    uuid, name, variety, row_spacing, optimal_temp, planting_depth, average_height,
    light_profile_id, soil_condition_id, planting_detail, is_perennial, days_to_emerge,
    days_to_flower, days_to_maturity, harvest_window, ph_value, estimate_loss_rate,
    estimate_revenue_per_hu, harvest_unit_id, water_needs
) VALUES (
    gen_random_uuid(), 'Mango', 'Nam Dok Mai', 8.0, 28.0, 0.5, 15.0, -- Planting depth for sapling
    (SELECT id FROM light_profiles WHERE name = 'Full Sun'),
    (SELECT id FROM soil_conditions WHERE name = 'Well-drained'),
    'Plant grafted saplings in well-drained soil. Requires distinct dry season for good flowering.',
    TRUE, NULL, 100, 1095, 60, 6.5, 0.12, 1.5, -- Days to maturity approx 3 years for first fruit, revenue per kg
    (SELECT id FROM harvest_units WHERE name = 'kg'), 25.0 -- mm per week during growing season
)
ON CONFLICT (uuid) DO NOTHING;

-- Plant 5: Durian (Monthong)
INSERT INTO plants (
    uuid, name, variety, row_spacing, optimal_temp, planting_depth, average_height,
    light_profile_id, soil_condition_id, planting_detail, is_perennial, days_to_emerge,
    days_to_flower, days_to_maturity, harvest_window, ph_value, estimate_loss_rate,
    estimate_revenue_per_hu, harvest_unit_id, water_needs
) VALUES (
    gen_random_uuid(), 'Durian', 'Monthong', 10.0, 27.0, 0.6, 30.0, -- Planting depth for sapling
    (SELECT id FROM light_profiles WHERE name = 'Full Sun'), -- Can tolerate some shade when young
    (SELECT id FROM soil_conditions WHERE name = 'Loamy'), -- Needs rich, deep, well-drained soil
    'Requires high humidity and rainfall, but well-drained soil. Sensitive to drought and strong winds.',
    TRUE, NULL, 150, 1825, 30, 6.0, 0.20, 4.0, -- Days to maturity approx 5 years, revenue per kg
    (SELECT id FROM harvest_units WHERE name = 'kg'), 40.0 -- mm per week, needs consistent moisture
)
ON CONFLICT (uuid) DO NOTHING;

-- Plant 6: Holy Basil (Kaphrao)
INSERT INTO plants (
    uuid, name, variety, row_spacing, optimal_temp, planting_depth, average_height,
    light_profile_id, soil_condition_id, planting_detail, is_perennial, days_to_emerge,
    days_to_flower, days_to_maturity, harvest_window, ph_value, estimate_loss_rate,
    estimate_revenue_per_hu, harvest_unit_id, water_needs
) VALUES (
    gen_random_uuid(), 'Holy Basil', 'Kaphrao Daeng (Red)', 0.3, 25.0, 0.005, 0.6,
    (SELECT id FROM light_profiles WHERE name = 'Full Sun'),
    (SELECT id FROM soil_conditions WHERE name = 'Well-drained'),
    'Easy to grow from seed or cuttings. Prefers warm conditions and regular watering. Harvest leaves before flowering for best flavor.',
    FALSE, -- Often grown as annual
    10, 40, 60, 90, -- Harvest window represents period of active growth for harvesting
    6.5, 0.08, 3.0, -- Revenue per kg (example)
    (SELECT id FROM harvest_units WHERE name = 'kg'), 20.0 -- mm per week
)
ON CONFLICT (uuid) DO NOTHING;

-- Plant 7: Lemongrass (Takhrai)
INSERT INTO plants (
    uuid, name, variety, row_spacing, optimal_temp, planting_depth, average_height,
    light_profile_id, soil_condition_id, planting_detail, is_perennial, days_to_emerge,
    days_to_flower, days_to_maturity, harvest_window, ph_value, estimate_loss_rate,
    estimate_revenue_per_hu, harvest_unit_id, water_needs
) VALUES (
    gen_random_uuid(), 'Lemongrass', 'Takhrai (Standard Thai)', 0.8, 28.0, 0.05, 1.5, -- Planting depth for divisions
    (SELECT id FROM light_profiles WHERE name = 'Full Sun'),
    (SELECT id FROM soil_conditions WHERE name = 'Well-drained'),
    'Propagate by dividing established clumps. Plant stalks with roots attached. Needs warmth and moisture.',
    TRUE, NULL, NULL, 90, 180, -- Maturity for harvesting stalks, harvest window ongoing
    6.8, 0.05, 2.0, -- Revenue per kg (example)
    (SELECT id FROM harvest_units WHERE name = 'kg'), 25.0 -- mm per week
)
ON CONFLICT (uuid) DO NOTHING;