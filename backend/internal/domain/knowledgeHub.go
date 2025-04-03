package domain

import (
	"context"
	"fmt"
	"strings"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type KnowledgeArticle struct {
	UUID        string
	Title       string
	Content     string
	Author      string
	PublishDate time.Time
	ReadTime    string
	Categories  []string
	ImageURL    string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (k *KnowledgeArticle) Validate() error {
	return validation.ValidateStruct(k,
		validation.Field(&k.Title, validation.Required),
		validation.Field(&k.Content, validation.Required),
		validation.Field(&k.Author, validation.Required),
		validation.Field(&k.PublishDate, validation.Required),
		validation.Field(&k.ImageURL,
			validation.By(func(value interface{}) error {
				if url, ok := value.(string); ok && url != "" {
					if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
						return fmt.Errorf("must be a valid URL starting with http:// or https://")
					}
				}
				return nil
			}),
		),
	)
}

type TableOfContent struct {
	UUID      string
	ArticleID string
	Title     string
	Order     int
	CreatedAt time.Time
	UpdatedAt time.Time
}

type RelatedArticle struct {
	UUID         string
	ArticleID    string
	RelatedTitle string
	RelatedTag   string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type KnowledgeHubRepository interface {
	GetArticleByID(context.Context, string) (KnowledgeArticle, error)
	GetArticlesByCategory(ctx context.Context, category string) ([]KnowledgeArticle, error)
	GetAllArticles(ctx context.Context) ([]KnowledgeArticle, error)
	CreateOrUpdateArticle(context.Context, *KnowledgeArticle) error
	DeleteArticle(context.Context, string) error

	GetTableOfContents(ctx context.Context, articleID string) ([]TableOfContent, error)
	GetRelatedArticles(ctx context.Context, articleID string) ([]RelatedArticle, error)
	CreateRelatedArticle(ctx context.Context, articleID string, related *RelatedArticle) error
}
