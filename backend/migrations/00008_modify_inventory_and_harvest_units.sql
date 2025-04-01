-- +goose Up
-- Step 1: Create inventory_category table
CREATE TABLE inventory_category (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Step 2: Insert sample categories
INSERT INTO inventory_category (name) 
VALUES 
    ('Seeds'),
    ('Tools'),
    ('Chemicals');

-- Step 3: Add category_id column to inventory_items
ALTER TABLE inventory_items
ADD COLUMN category_id INT;

-- Step 4: Link inventory_items to inventory_category
ALTER TABLE inventory_items
ADD CONSTRAINT fk_inventory_category FOREIGN KEY (category_id) REFERENCES inventory_category(id) ON DELETE SET NULL;

-- Step 5: Remove old columns (type, category, unit) from inventory_items
ALTER TABLE inventory_items
DROP COLUMN type,
DROP COLUMN category,
DROP COLUMN unit;

-- Step 6: Add unit_id column to inventory_items
ALTER TABLE inventory_items
ADD COLUMN unit_id INT;

-- Step 7: Link inventory_items to harvest_units
ALTER TABLE inventory_items
ADD CONSTRAINT fk_inventory_unit FOREIGN KEY (unit_id) REFERENCES harvest_units(id) ON DELETE SET NULL;

-- Step 8: Insert new unit values into harvest_units
INSERT INTO harvest_units (name) 
VALUES 
    ('Tonne'),
    ('KG');

-- +goose Down
-- Reverse Step 8: Remove inserted unit values
DELETE FROM harvest_units WHERE name IN ('Tonne', 'KG');

-- Reverse Step 7: Remove the foreign key constraint
ALTER TABLE inventory_items
DROP CONSTRAINT fk_inventory_unit;

-- Reverse Step 6: Remove unit_id column from inventory_items
ALTER TABLE inventory_items
DROP COLUMN unit_id;

-- Reverse Step 5: Add back type, category, and unit columns
ALTER TABLE inventory_items
ADD COLUMN type TEXT NOT NULL,
ADD COLUMN category TEXT NOT NULL,
ADD COLUMN unit TEXT NOT NULL;

-- Reverse Step 4: Remove foreign key constraint from inventory_items
ALTER TABLE inventory_items
DROP CONSTRAINT fk_inventory_category;

-- Reverse Step 3: Remove category_id column from inventory_items
ALTER TABLE inventory_items
DROP COLUMN category_id;

-- Reverse Step 2: Drop inventory_category table
DROP TABLE inventory_category;
