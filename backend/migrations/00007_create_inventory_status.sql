-- +goose Up
-- Insert default statuses into the inventory_status table
INSERT INTO inventory_status (name) 
VALUES 
    ('In Stock'),
    ('Low Stock'),
    ('Out Of Stock');