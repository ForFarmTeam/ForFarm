-- +goose Up
CREATE TABLE light_profiles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE soil_conditions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE harvest_units (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);  

CREATE TABLE plants (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    variety TEXT,
    row_spacing DOUBLE PRECISION,
    optimal_temp DOUBLE PRECISION,
    planting_depth DOUBLE PRECISION,
    average_height DOUBLE PRECISION,
    light_profile_id INT NOT NULL,
    soil_condition_id INT NOT NULL,
    planting_detail TEXT,
    is_perennial BOOLEAN NOT NULL DEFAULT FALSE,
    days_to_emerge INT,
    days_to_flower INT,
    days_to_maturity INT,
    harvest_window INT,
    ph_value DOUBLE PRECISION,
    estimate_loss_rate DOUBLE PRECISION,
    estimate_revenue_per_hu DOUBLE PRECISION,
    harvest_unit_id INT NOT NULL,
    water_needs DOUBLE PRECISION,
    CONSTRAINT fk_plant_light_profile FOREIGN KEY (light_profile_id) REFERENCES light_profiles(id),
    CONSTRAINT fk_plant_soil_condition FOREIGN KEY (soil_condition_id) REFERENCES soil_conditions(id),
    CONSTRAINT fk_plant_harvest_unit FOREIGN KEY (harvest_unit_id) REFERENCES harvest_units(id)
);

CREATE TABLE farms (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    lat DOUBLE PRECISION[] NOT NULL,
    lon DOUBLE PRECISION[] NOT NULL,
    plant_types UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    owner_id UUID NOT NULL,
    CONSTRAINT fk_farm_owner FOREIGN KEY (owner_id) REFERENCES users(uuid) ON DELETE CASCADE
);

CREATE TABLE croplands (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    priority INT NOT NULL,
    land_size DOUBLE PRECISION NOT NULL,
    growth_stage TEXT NOT NULL,
    plant_id UUID NOT NULL,
    farm_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_cropland_farm FOREIGN KEY (farm_id) REFERENCES farms(uuid) ON DELETE CASCADE,
    CONSTRAINT fk_cropland_plant FOREIGN KEY (plant_id) REFERENCES plants(uuid) ON DELETE CASCADE
);
