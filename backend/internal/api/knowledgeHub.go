package api

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/gofrs/uuid"
)

func (a *api) registerKnowledgeHubRoutes(_ chi.Router, api huma.API) {
	tags := []string{"knowledge-hub"}

	prefix := "/knowledge-hub"

	huma.Register(api, huma.Operation{
		OperationID: "getAllKnowledgeArticles",
		Method:      http.MethodGet,
		Path:        prefix,
		Tags:        tags,
	}, a.getAllKnowledgeArticlesHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getKnowledgeArticleByID",
		Method:      http.MethodGet,
		Path:        prefix + "/{uuid}",
		Tags:        tags,
	}, a.getKnowledgeArticleByIDHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getKnowledgeArticlesByCategory",
		Method:      http.MethodGet,
		Path:        prefix + "/category/{category}",
		Tags:        tags,
	}, a.getKnowledgeArticlesByCategoryHandler)

	huma.Register(api, huma.Operation{
		OperationID: "createOrUpdateKnowledgeArticle",
		Method:      http.MethodPost,
		Path:        prefix,
		Tags:        tags,
	}, a.createOrUpdateKnowledgeArticleHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getArticleTableOfContents",
		Method:      http.MethodGet,
		Path:        prefix + "/{uuid}/toc",
		Tags:        tags,
	}, a.getArticleTableOfContentsHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getArticleRelatedArticles",
		Method:      http.MethodGet,
		Path:        prefix + "/{uuid}/related",
		Tags:        tags,
	}, a.getArticleRelatedArticlesHandler)

	huma.Register(api, huma.Operation{
		OperationID: "createRelatedArticle",
		Method:      http.MethodPost,
		Path:        prefix + "/{uuid}/related",
		Tags:        tags,
	}, a.createRelatedArticleHandler)

	huma.Register(api, huma.Operation{
		OperationID: "generateTableOfContents",
		Method:      http.MethodPost,
		Path:        prefix + "/{uuid}/generate-toc",
		Tags:        tags,
	}, a.generateTOCHandler)
}

type GetKnowledgeArticlesOutput struct {
	Body struct {
		Articles []domain.KnowledgeArticle `json:"articles"`
	} `json:"body"`
}

type GetKnowledgeArticleByIDOutput struct {
	Body struct {
		Article domain.KnowledgeArticle `json:"article"`
	} `json:"body"`
}

type CreateOrUpdateKnowledgeArticleInput struct {
	Body struct {
		UUID        string    `json:"uuid,omitempty"`
		Title       string    `json:"title"`
		Content     string    `json:"content"`
		Author      string    `json:"author"`
		PublishDate time.Time `json:"publish_date"`
		ReadTime    string    `json:"read_time"`
		Categories  []string  `json:"categories"`
		ImageURL    string    `json:"image_url"`
	} `json:"body"`
}

type CreateOrUpdateKnowledgeArticleOutput struct {
	Body struct {
		Article domain.KnowledgeArticle `json:"article"`
	} `json:"body"`
}

type GetTableOfContentsOutput struct {
	Body struct {
		TableOfContents []domain.TableOfContent `json:"table_of_contents"`
	} `json:"body"`
}

type GetRelatedArticlesOutput struct {
	Body struct {
		RelatedArticles []domain.RelatedArticle `json:"related_articles"`
	} `json:"body"`
}

type CreateRelatedArticleInput struct {
	UUID string `path:"uuid"`
	Body struct {
		RelatedTitle string `json:"related_title"`
		RelatedTag   string `json:"related_tag"`
	} `json:"body"`
}

type GenerateTOCInput struct {
	UUID string `path:"uuid"`
}

type GenerateTOCOutput struct {
	Body struct {
		TableOfContents []domain.TableOfContent `json:"table_of_contents"`
	} `json:"body"`
}

func (a *api) getAllKnowledgeArticlesHandler(ctx context.Context, input *struct{}) (*GetKnowledgeArticlesOutput, error) {
	resp := &GetKnowledgeArticlesOutput{}

	articles, err := a.knowledgeHubRepo.GetAllArticles(ctx)
	if err != nil {
		return nil, err
	}

	resp.Body.Articles = articles
	return resp, nil
}

func (a *api) getKnowledgeArticleByIDHandler(ctx context.Context, input *struct {
	UUID string `path:"uuid"`
}) (*GetKnowledgeArticleByIDOutput, error) {
	resp := &GetKnowledgeArticleByIDOutput{}

	if input.UUID == "" {
		return nil, huma.Error400BadRequest("UUID parameter is required")
	}

	if _, err := uuid.FromString(input.UUID); err != nil {
		return nil, huma.Error400BadRequest("invalid UUID format")
	}

	article, err := a.knowledgeHubRepo.GetArticleByID(ctx, input.UUID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, huma.Error404NotFound("article not found")
		}
		return nil, err
	}

	resp.Body.Article = article
	return resp, nil
}

func (a *api) getKnowledgeArticlesByCategoryHandler(ctx context.Context, input *struct {
	Category string `path:"category"`
}) (*GetKnowledgeArticlesOutput, error) {
	resp := &GetKnowledgeArticlesOutput{}

	if input.Category == "" {
		return nil, huma.Error400BadRequest("category parameter is required")
	}

	articles, err := a.knowledgeHubRepo.GetArticlesByCategory(ctx, input.Category)
	if err != nil {
		return nil, err
	}

	resp.Body.Articles = articles
	return resp, nil
}

func (a *api) createOrUpdateKnowledgeArticleHandler(ctx context.Context, input *CreateOrUpdateKnowledgeArticleInput) (*CreateOrUpdateKnowledgeArticleOutput, error) {
	resp := &CreateOrUpdateKnowledgeArticleOutput{}

	if input.Body.Title == "" {
		return nil, huma.Error400BadRequest("title is required")
	}
	if input.Body.Content == "" {
		return nil, huma.Error400BadRequest("content is required")
	}
	if input.Body.Author == "" {
		return nil, huma.Error400BadRequest("author is required")
	}
	if len(input.Body.Categories) == 0 {
		return nil, huma.Error400BadRequest("at least one category is required")
	}

	if input.Body.UUID != "" {
		if _, err := uuid.FromString(input.Body.UUID); err != nil {
			return nil, huma.Error400BadRequest("invalid UUID format")
		}
	}

	article := &domain.KnowledgeArticle{
		UUID:        input.Body.UUID,
		Title:       input.Body.Title,
		Content:     input.Body.Content,
		Author:      input.Body.Author,
		PublishDate: input.Body.PublishDate,
		ReadTime:    input.Body.ReadTime,
		Categories:  input.Body.Categories,
		ImageURL:    input.Body.ImageURL,
	}

	if err := a.knowledgeHubRepo.CreateOrUpdateArticle(ctx, article); err != nil {
		return nil, err
	}

	resp.Body.Article = *article
	return resp, nil
}

func (a *api) getArticleTableOfContentsHandler(ctx context.Context, input *struct {
	UUID string `path:"uuid"`
}) (*GetTableOfContentsOutput, error) {
	resp := &GetTableOfContentsOutput{}

	if input.UUID == "" {
		return nil, huma.Error400BadRequest("UUID parameter is required")
	}

	if _, err := uuid.FromString(input.UUID); err != nil {
		return nil, huma.Error400BadRequest("invalid UUID format")
	}

	toc, err := a.knowledgeHubRepo.GetTableOfContents(ctx, input.UUID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, huma.Error404NotFound("article not found")
		}
		return nil, err
	}

	resp.Body.TableOfContents = toc
	return resp, nil
}

func (a *api) getArticleRelatedArticlesHandler(ctx context.Context, input *struct {
	UUID string `path:"uuid"`
}) (*GetRelatedArticlesOutput, error) {
	resp := &GetRelatedArticlesOutput{}

	if input.UUID == "" {
		return nil, huma.Error400BadRequest("UUID parameter is required")
	}

	if _, err := uuid.FromString(input.UUID); err != nil {
		return nil, huma.Error400BadRequest("invalid UUID format")
	}

	related, err := a.knowledgeHubRepo.GetRelatedArticles(ctx, input.UUID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, huma.Error404NotFound("article not found")
		}
		return nil, err
	}

	resp.Body.RelatedArticles = related
	return resp, nil
}

func (a *api) createRelatedArticleHandler(
	ctx context.Context,
	input *CreateRelatedArticleInput,
) (*struct{}, error) {
	// Validate main article exists
	if _, err := a.knowledgeHubRepo.GetArticleByID(ctx, input.UUID); err != nil {
		return nil, huma.Error404NotFound("main article not found")
	}

	// Create related article
	related := &domain.RelatedArticle{
		RelatedTitle: input.Body.RelatedTitle,
		RelatedTag:   input.Body.RelatedTag,
	}

	if err := a.knowledgeHubRepo.CreateRelatedArticle(ctx, input.UUID, related); err != nil {
		return nil, huma.Error500InternalServerError("failed to create related article")
	}

	return nil, nil
}

func generateTOCFromContent(content string) []domain.TableOfContent {
	var toc []domain.TableOfContent
	lines := strings.Split(content, "\n")
	order := 0

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "# ") {
			order++
			toc = append(toc, domain.TableOfContent{
				Title: strings.TrimPrefix(line, "# "),
				Level: 1,
				Order: order,
			})
		} else if strings.HasPrefix(line, "## ") {
			order++
			toc = append(toc, domain.TableOfContent{
				Title: strings.TrimPrefix(line, "## "),
				Level: 2,
				Order: order,
			})
		} else if strings.HasPrefix(line, "### ") {
			order++
			toc = append(toc, domain.TableOfContent{
				Title: strings.TrimPrefix(line, "### "),
				Level: 3,
				Order: order,
			})
		}
		// Add more levels if needed
	}

	return toc
}

func (a *api) generateTOCHandler(
	ctx context.Context,
	input *GenerateTOCInput,
) (*GenerateTOCOutput, error) {
	resp := &GenerateTOCOutput{}

	// Validate UUID format
	if _, err := uuid.FromString(input.UUID); err != nil {
		return nil, huma.Error400BadRequest("invalid UUID format")
	}

	// Get the article
	article, err := a.knowledgeHubRepo.GetArticleByID(ctx, input.UUID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return nil, huma.Error404NotFound("article not found")
		}
		return nil, err
	}

	// Generate TOC from content
	tocItems := generateTOCFromContent(article.Content)

	// Save to database
	if err := a.knowledgeHubRepo.CreateTableOfContents(ctx, input.UUID, tocItems); err != nil {
		return nil, huma.Error500InternalServerError("failed to save table of contents")
	}

	resp.Body.TableOfContents = tocItems
	return resp, nil
}
