package repository

import (
	"context"
	"strings"

	"github.com/forfarm/backend/internal/domain"
	"github.com/google/uuid"
)

type postgresKnowledgeHubRepository struct {
	conn Connection
}

func NewPostgresKnowledgeHub(conn Connection) domain.KnowledgeHubRepository {
	return &postgresKnowledgeHubRepository{conn: conn}
}

func (p *postgresKnowledgeHubRepository) fetchArticles(ctx context.Context, query string, args ...interface{}) ([]domain.KnowledgeArticle, error) {
	rows, err := p.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []domain.KnowledgeArticle
	for rows.Next() {
		var a domain.KnowledgeArticle
		if err := rows.Scan(
			&a.UUID,
			&a.Title,
			&a.Content,
			&a.Author,
			&a.PublishDate,
			&a.ReadTime,
			&a.Categories,
			&a.CreatedAt,
			&a.UpdatedAt,
		); err != nil {
			return nil, err
		}
		articles = append(articles, a)
	}
	return articles, nil
}

func (p *postgresKnowledgeHubRepository) GetArticleByID(ctx context.Context, uuid string) (domain.KnowledgeArticle, error) {
	query := `
		SELECT uuid, title, content, author, publish_date, read_time, categories, created_at, updated_at
		FROM knowledge_articles
		WHERE uuid = $1`

	articles, err := p.fetchArticles(ctx, query, uuid)
	if err != nil {
		return domain.KnowledgeArticle{}, err
	}
	if len(articles) == 0 {
		return domain.KnowledgeArticle{}, domain.ErrNotFound
	}
	return articles[0], nil
}

func (p *postgresKnowledgeHubRepository) GetArticlesByCategory(ctx context.Context, category string) ([]domain.KnowledgeArticle, error) {
	query := `
		SELECT uuid, title, content, author, publish_date, read_time, categories, created_at, updated_at
		FROM knowledge_articles
		WHERE $1 = ANY(categories)`

	return p.fetchArticles(ctx, query, category)
}

func (p *postgresKnowledgeHubRepository) GetAllArticles(ctx context.Context) ([]domain.KnowledgeArticle, error) {
	query := `
		SELECT uuid, title, content, author, publish_date, read_time, categories, created_at, updated_at
		FROM knowledge_articles`

	return p.fetchArticles(ctx, query)
}

func (p *postgresKnowledgeHubRepository) CreateOrUpdateArticle(ctx context.Context, article *domain.KnowledgeArticle) error {
	if strings.TrimSpace(article.UUID) == "" {
		article.UUID = uuid.New().String()
	}

	query := `  
        INSERT INTO knowledge_articles (uuid, title, content, author, publish_date, read_time, categories, created_at, updated_at)  
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (uuid) DO UPDATE
        SET title = EXCLUDED.title,
            content = EXCLUDED.content,
            author = EXCLUDED.author,
            publish_date = EXCLUDED.publish_date,
            read_time = EXCLUDED.read_time,
            categories = EXCLUDED.categories,
            updated_at = NOW()
        RETURNING uuid, created_at, updated_at`

	return p.conn.QueryRow(
		ctx,
		query,
		article.UUID,
		article.Title,
		article.Content,
		article.Author,
		article.PublishDate,
		article.ReadTime,
		article.Categories,
	).Scan(&article.UUID, &article.CreatedAt, &article.UpdatedAt)
}

func (p *postgresKnowledgeHubRepository) DeleteArticle(ctx context.Context, uuid string) error {
	query := `DELETE FROM knowledge_articles WHERE uuid = $1`
	_, err := p.conn.Exec(ctx, query, uuid)
	return err
}

func (p *postgresKnowledgeHubRepository) fetchTableOfContents(ctx context.Context, query string, args ...interface{}) ([]domain.TableOfContent, error) {
	rows, err := p.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tocItems []domain.TableOfContent
	for rows.Next() {
		var t domain.TableOfContent
		if err := rows.Scan(
			&t.UUID,
			&t.ArticleID,
			&t.Title,
			&t.Order,
			&t.CreatedAt,
			&t.UpdatedAt,
		); err != nil {
			return nil, err
		}
		tocItems = append(tocItems, t)
	}
	return tocItems, nil
}

func (p *postgresKnowledgeHubRepository) GetTableOfContents(ctx context.Context, articleID string) ([]domain.TableOfContent, error) {
	query := `
		SELECT uuid, article_id, title, "order", created_at, updated_at
		FROM table_of_contents
		WHERE article_id = $1
		ORDER BY "order" ASC`

	return p.fetchTableOfContents(ctx, query, articleID)
}

func (p *postgresKnowledgeHubRepository) fetchRelatedArticles(ctx context.Context, query string, args ...interface{}) ([]domain.RelatedArticle, error) {
	rows, err := p.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var relatedArticles []domain.RelatedArticle
	for rows.Next() {
		var r domain.RelatedArticle
		if err := rows.Scan(
			&r.UUID,
			&r.ArticleID,
			&r.RelatedTitle,
			&r.RelatedTag,
			&r.CreatedAt,
			&r.UpdatedAt,
		); err != nil {
			return nil, err
		}
		relatedArticles = append(relatedArticles, r)
	}
	return relatedArticles, nil
}

func (p *postgresKnowledgeHubRepository) GetRelatedArticles(ctx context.Context, articleID string) ([]domain.RelatedArticle, error) {
	query := `
		SELECT uuid, article_id, related_title, related_tag, created_at, updated_at
		FROM related_articles
		WHERE article_id = $1`

	return p.fetchRelatedArticles(ctx, query, articleID)
}

func (p *postgresKnowledgeHubRepository) CreateRelatedArticle(
	ctx context.Context,
	articleID string,
	related *domain.RelatedArticle,
) error {
	related.UUID = uuid.New().String() // Generate UUID
	related.ArticleID = articleID      // Link to main article

	query := `
        INSERT INTO related_articles 
        (uuid, article_id, related_title, related_tag, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())`

	_, err := p.conn.Exec(
		ctx,
		query,
		related.UUID,
		related.ArticleID,
		related.RelatedTitle,
		related.RelatedTag,
	)
	return err
}
