-- +goose Up
ALTER TABLE inventory_items
ADD COLUMN status_id INT;

UPDATE inventory_items
SET status_id = (SELECT id FROM inventory_status WHERE name = inventory_items.status);

ALTER TABLE inventory_items
DROP COLUMN status;

ALTER TABLE inventory_items
ADD CONSTRAINT fk_inventory_items_status FOREIGN KEY (status_id) REFERENCES inventory_status(id) ON DELETE CASCADE;

CREATE INDEX idx_inventory_items_status_id ON inventory_items(status_id);

