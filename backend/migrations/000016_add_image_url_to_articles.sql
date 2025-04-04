-- +goose Up
ALTER TABLE knowledge_articles
    ADD COLUMN image_url TEXT;

-- +goose Down
ALTER TABLE knowledge_articles
DROP COLUMN image_url;