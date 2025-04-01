-- +goose Up
-- Create the lookup table for inventory item statuses
CREATE TABLE inventory_status (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Insert common default statuses needed for the next migration (00008)
INSERT INTO inventory_status (name) VALUES
('In Stock'),
('Low Stock'),
('Out of Stock'),
('Expired'),
('Reserved');
-- Add any other statuses that might exist in the old 'status' text column

-- +goose Down
DROP TABLE IF EXISTS inventory_status;