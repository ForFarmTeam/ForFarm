-- +goose Up
-- Step 1: Create inventory_category table
CREATE TABLE inventory_category (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Step 2: Insert sample categories (add more as needed)
INSERT INTO inventory_category (name)
VALUES
    ('Seeds'),
    ('Fertilizers'),
    ('Pesticides'),
    ('Herbicides'),
    ('Tools'),
    ('Equipment'),
    ('Fuel'),
    ('Harvested Goods'), -- If harvested items go into inventory
    ('Other');

-- Step 3: Add category_id column to inventory_items
ALTER TABLE inventory_items
ADD COLUMN category_id INT;

-- Step 4: Update category_id based on old 'category' text (best effort)
-- Map known old categories to new IDs. Set others to 'Other' or NULL.
UPDATE inventory_items inv SET category_id = (SELECT id FROM inventory_category cat WHERE cat.name = inv.category)
WHERE EXISTS (SELECT 1 FROM inventory_category cat WHERE cat.name = inv.category);
-- Example: Set remaining to 'Other'
-- UPDATE inventory_items SET category_id = (SELECT id FROM inventory_category WHERE name = 'Other') WHERE category_id IS NULL;

-- Step 5: Add foreign key constraint for category_id
ALTER TABLE inventory_items
ADD CONSTRAINT fk_inventory_category FOREIGN KEY (category_id) REFERENCES inventory_category(id) ON DELETE SET NULL; -- Or RESTRICT

-- Step 6: Add unit_id column to inventory_items (linking to harvest_units)
ALTER TABLE inventory_items
ADD COLUMN unit_id INT;

-- Step 7: Insert common inventory units into harvest_units table (if they don't exist)
-- harvest_units was created in 00002, potentially with crop-specific units. Add general ones here.
INSERT INTO harvest_units (name) VALUES
    ('Piece(s)'),
    ('Bag(s)'),
    ('Box(es)'),
    ('Liter(s)'),
    ('Gallon(s)'),
    ('kg'), -- Use consistent casing, e.g., lowercase
    ('tonne'),
    ('meter(s)'),
    ('hour(s)')
ON CONFLICT (name) DO NOTHING; -- Avoid errors if units already exist

-- Step 8: Update unit_id based on old 'unit' text (best effort)
UPDATE inventory_items inv SET unit_id = (SELECT id FROM harvest_units hu WHERE hu.name = inv.unit)
WHERE EXISTS (SELECT 1 FROM harvest_units hu WHERE hu.name = inv.unit);
-- Handle cases where the old unit might not be in the harvest_units table (optional)
-- UPDATE inventory_items SET unit_id = <default_unit_id> WHERE unit_id IS NULL;

-- Step 9: Add foreign key constraint for unit_id
ALTER TABLE inventory_items
ADD CONSTRAINT fk_inventory_unit FOREIGN KEY (unit_id) REFERENCES harvest_units(id) ON DELETE SET NULL; -- Or RESTRICT

-- Step 10: Remove old columns (type, category, unit) from inventory_items
ALTER TABLE inventory_items
DROP COLUMN type,
DROP COLUMN category,
DROP COLUMN unit;

-- Step 11: Add indexes for new foreign keys
CREATE INDEX idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_unit_id ON inventory_items(unit_id);


-- +goose Down
-- Reverse Step 11: Drop indexes
DROP INDEX IF EXISTS idx_inventory_items_category_id;
DROP INDEX IF EXISTS idx_inventory_items_unit_id;

-- Reverse Step 10: Add back type, category, and unit columns
-- Mark as NOT NULL if they were originally required
ALTER TABLE inventory_items
ADD COLUMN type TEXT,
ADD COLUMN category TEXT,
ADD COLUMN unit TEXT;

-- Attempt to restore data (best effort, potential data loss)
UPDATE inventory_items inv SET category = (SELECT name FROM inventory_category cat WHERE cat.id = inv.category_id)
WHERE inv.category_id IS NOT NULL;
UPDATE inventory_items inv SET unit = (SELECT name FROM harvest_units hu WHERE hu.id = inv.unit_id)
WHERE inv.unit_id IS NOT NULL;
-- Cannot restore 'type' as it was dropped without replacement.

-- Reverse Step 9: Remove the foreign key constraint for unit
ALTER TABLE inventory_items
DROP CONSTRAINT IF EXISTS fk_inventory_unit;

-- Reverse Step 8: (Data restoration attempted above)

-- Reverse Step 7: (Cannot easily remove only units added here without knowing originals)
-- DELETE FROM harvest_units WHERE name IN ('Piece(s)', 'Bag(s)', ...); -- Risky if names overlapped

-- Reverse Step 6: Remove unit_id column from inventory_items
ALTER TABLE inventory_items
DROP COLUMN unit_id;

-- Reverse Step 5: Remove foreign key constraint for category
ALTER TABLE inventory_items
DROP CONSTRAINT IF EXISTS fk_inventory_category;

-- Reverse Step 4: (Data restoration attempted above)

-- Reverse Step 3: Remove category_id column from inventory_items
ALTER TABLE inventory_items
DROP COLUMN category_id;

-- Reverse Step 2: (Data in inventory_category table is kept unless explicitly dropped)

-- Reverse Step 1: Drop inventory_category table
DROP TABLE IF EXISTS inventory_category;