-- +goose Up
-- +goose StatementBegin
CREATE TABLE knowledge_articles (
                                    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    title TEXT NOT NULL,
                                    content TEXT NOT NULL,
                                    author TEXT NOT NULL,
                                    publish_date TIMESTAMPTZ NOT NULL,
                                    read_time TEXT NOT NULL,
                                    categories TEXT[] NOT NULL,
                                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE table_of_contents (
    uuid UUID PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES knowledge_articles(uuid),
    title TEXT NOT NULL,
    level INT NOT NULL,
    "order" INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE related_articles (
                                  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  article_id UUID NOT NULL,
                                  related_title TEXT NOT NULL,
                                  related_tag TEXT NOT NULL,
                                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                  CONSTRAINT fk_related_article FOREIGN KEY (article_id) REFERENCES knowledge_articles(uuid) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS related_articles;
DROP TABLE IF EXISTS table_of_contents;
DROP TABLE IF EXISTS knowledge_articles;
-- +goose StatementEnd