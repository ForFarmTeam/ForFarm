-- +goose Up
-- Add the status_id column to link to the new inventory_status table
ALTER TABLE inventory_items
ADD COLUMN status_id INT;

-- Update the new status_id based on the old text status column
-- This relies on the inventory_status table being populated (done in 00007)
UPDATE inventory_items inv
SET status_id = (SELECT id FROM inventory_status stat WHERE stat.name = inv.status)
WHERE EXISTS (SELECT 1 FROM inventory_status stat WHERE stat.name = inv.status);
-- Handle cases where the old status might not be in the new table (optional: set to a default or log)
-- UPDATE inventory_items SET status_id = <default_status_id> WHERE status_id IS NULL;

-- Drop the old text status column
ALTER TABLE inventory_items
DROP COLUMN status;

-- Add the foreign key constraint
-- Make status_id NOT NULL if every item must have a status
ALTER TABLE inventory_items
ADD CONSTRAINT fk_inventory_items_status FOREIGN KEY (status_id) REFERENCES inventory_status(id) ON DELETE SET NULL; -- Or ON DELETE RESTRICT

-- Create an index on the new foreign key column
CREATE INDEX idx_inventory_items_status_id ON inventory_items(status_id);


-- +goose Down
-- Drop the index
DROP INDEX IF EXISTS idx_inventory_items_status_id;

-- Drop the foreign key constraint
ALTER TABLE inventory_items
DROP CONSTRAINT IF EXISTS fk_inventory_items_status;

-- Add the old status column back
ALTER TABLE inventory_items
ADD COLUMN status TEXT; -- Make NOT NULL if it was originally

-- Attempt to restore the status text from status_id (data loss if status was deleted)
UPDATE inventory_items inv
SET status = (SELECT name FROM inventory_status stat WHERE stat.id = inv.status_id)
WHERE inv.status_id IS NOT NULL;

-- Drop the status_id column
ALTER TABLE inventory_items
DROP COLUMN status_id;