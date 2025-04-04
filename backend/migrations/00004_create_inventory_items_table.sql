-- +goose Up
-- Creates the initial inventory_items table.
-- Note: 'category', 'type', 'unit', and 'status' columns will be modified/replaced by later migrations.
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- To be replaced by category_id
    type TEXT NOT NULL,     -- To be dropped
    quantity DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,     -- To be replaced by unit_id
    date_added TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,   -- To be replaced by status_id
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_inventory_items_user FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_user_category ON inventory_items(user_id, category);
CREATE INDEX idx_inventory_items_user_status ON inventory_items(user_id, status);

-- +goose Down
DROP TABLE IF EXISTS inventory_items; -- Indexes are dropped automatically