package api

import (
	"context"
	"net/http"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/domain"
	"github.com/go-chi/chi/v5"
)

func (a *api) registerInventoryRoutes(_ chi.Router, api huma.API) {
	tags := []string{"inventory"}
	prefix := "/inventory"

	huma.Register(api, huma.Operation{
		OperationID: "createInventoryItem",
		Method:      http.MethodPost,
		Path:        prefix,
		Tags:        tags,
	}, a.createInventoryItemHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getInventoryItemsByUser",
		Method:      http.MethodGet,
		Path:        prefix,
		Tags:        tags,
	}, a.getInventoryItemsByUserHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getInventoryItem",
		Method:      http.MethodGet,
		Path:        prefix + "/{id}",
		Tags:        tags,
	}, a.getInventoryItemHandler)

	huma.Register(api, huma.Operation{
		OperationID: "updateInventoryItem",
		Method:      http.MethodPut,
		Path:        prefix + "/{id}",
		Tags:        tags,
	}, a.updateInventoryItemHandler)

	huma.Register(api, huma.Operation{
		OperationID: "deleteInventoryItem",
		Method:      http.MethodDelete,
		Path:        prefix + "/{id}",
		Tags:        tags,
	}, a.deleteInventoryItemHandler)
}

type InventoryItemResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Category  string    `json:"category"`
	Type      string    `json:"type"`
	Quantity  float64   `json:"quantity"`
	Unit      string    `json:"unit"`
	DateAdded time.Time `json:"date_added"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
}

type CreateInventoryItemInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	UserID string `header:"user_id" required:"true" example:"user-uuid"`
	Body   struct {
		Name      string    `json:"name" required:"true"`
		Category  string    `json:"category" required:"true"`
		Type      string    `json:"type" required:"true"`
		Quantity  float64   `json:"quantity" required:"true"`
		Unit      string    `json:"unit" required:"true"`
		DateAdded time.Time `json:"date_added" required:"true"`
		Status    string    `json:"status" required:"true" enum:"In Stock,Low Stock,Out of Stock"`
	}
}

type CreateInventoryItemOutput struct {
	Body struct {
		ID string `json:"id"`
	}
}

func (a *api) createInventoryItemHandler(ctx context.Context, input *CreateInventoryItemInput) (*CreateInventoryItemOutput, error) {
	item := &domain.InventoryItem{
		UserID:    input.UserID,
		Name:      input.Body.Name,
		Category:  input.Body.Category,
		Type:      input.Body.Type,
		Quantity:  input.Body.Quantity,
		Unit:      input.Body.Unit,
		DateAdded: input.Body.DateAdded,
		Status:    domain.InventoryStatus(input.Body.Status),
	}

	if err := item.Validate(); err != nil {
		return nil, huma.Error422UnprocessableEntity(err.Error())
	}

	err := a.inventoryRepo.CreateOrUpdate(ctx, item)
	if err != nil {
		return nil, err
	}

	return &CreateInventoryItemOutput{Body: struct {
		ID string `json:"id"`
	}{ID: item.ID}}, nil
}

type GetInventoryItemsInput struct {
	Header      string    `header:"Authorization" required:"true" example:"Bearer token"`
	UserID      string    `header:"user_id" required:"true" example:"user-uuid"`
	Category    string    `query:"category"`
	Type        string    `query:"type"`
	Status      string    `query:"status" enum:"In Stock,Low Stock,Out of Stock"`
	StartDate   time.Time `query:"start_date" format:"date-time"`
	EndDate     time.Time `query:"end_date" format:"date-time"`
	SearchQuery string    `query:"search"`
	SortBy      string    `query:"sort_by" enum:"name,category,type,quantity,date_added,status,created_at"`
	SortOrder   string    `query:"sort_order" enum:"asc,desc" default:"desc"`
}

type GetInventoryItemsOutput struct {
	Body []InventoryItemResponse
}

func (a *api) getInventoryItemsByUserHandler(ctx context.Context, input *GetInventoryItemsInput) (*GetInventoryItemsOutput, error) {
	filter := domain.InventoryFilter{
		UserID:      input.UserID,
		Category:    input.Category,
		Type:        input.Type,
		Status:      domain.InventoryStatus(input.Status),
		StartDate:   input.StartDate,
		EndDate:     input.EndDate,
		SearchQuery: input.SearchQuery,
	}

	sort := domain.InventorySort{
		Field:     input.SortBy,
		Direction: input.SortOrder,
	}

	items, err := a.inventoryRepo.GetByUserID(ctx, input.UserID, filter, sort)
	if err != nil {
		return nil, err
	}

	response := make([]InventoryItemResponse, len(items))
	for i, item := range items {
		response[i] = InventoryItemResponse{
			ID:        item.ID,
			Name:      item.Name,
			Category:  item.Category,
			Type:      item.Type,
			Quantity:  item.Quantity,
			Unit:      item.Unit,
			DateAdded: item.DateAdded,
			Status:    string(item.Status),
			CreatedAt: item.CreatedAt,
			UpdatedAt: item.UpdatedAt,
		}
	}

	return &GetInventoryItemsOutput{Body: response}, nil
}

type GetInventoryItemInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	UserID string `header:"user_id" required:"true" example:"user-uuid"`
	ID     string `path:"id"`
}

type GetInventoryItemOutput struct {
	Body InventoryItemResponse
}

func (a *api) getInventoryItemHandler(ctx context.Context, input *GetInventoryItemInput) (*GetInventoryItemOutput, error) {
	item, err := a.inventoryRepo.GetByID(ctx, input.ID, input.UserID)
	if err != nil {
		return nil, err
	}

	return &GetInventoryItemOutput{Body: InventoryItemResponse{
		ID:        item.ID,
		Name:      item.Name,
		Category:  item.Category,
		Type:      item.Type,
		Quantity:  item.Quantity,
		Unit:      item.Unit,
		DateAdded: item.DateAdded,
		Status:    string(item.Status),
		CreatedAt: item.CreatedAt,
		UpdatedAt: item.UpdatedAt,
	}}, nil
}

type UpdateInventoryItemInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	UserID string `header:"user_id" required:"true" example:"user-uuid"`
	ID     string `path:"id"`
	Body   struct {
		Name      string    `json:"name"`
		Category  string    `json:"category"`
		Type      string    `json:"type"`
		Quantity  float64   `json:"quantity"`
		Unit      string    `json:"unit"`
		DateAdded time.Time `json:"date_added"`
		Status    string    `json:"status" enum:"In Stock,Low Stock,Out of Stock"`
	}
}

type UpdateInventoryItemOutput struct {
	Body InventoryItemResponse
}

func (a *api) updateInventoryItemHandler(ctx context.Context, input *UpdateInventoryItemInput) (*UpdateInventoryItemOutput, error) {
	item, err := a.inventoryRepo.GetByID(ctx, input.ID, input.UserID)
	if err != nil {
		return nil, err
	}

	if input.Body.Name != "" {
		item.Name = input.Body.Name
	}
	if input.Body.Category != "" {
		item.Category = input.Body.Category
	}
	if input.Body.Type != "" {
		item.Type = input.Body.Type
	}
	if input.Body.Quantity != 0 {
		item.Quantity = input.Body.Quantity
	}
	if input.Body.Unit != "" {
		item.Unit = input.Body.Unit
	}
	if !input.Body.DateAdded.IsZero() {
		item.DateAdded = input.Body.DateAdded
	}
	if input.Body.Status != "" {
		item.Status = domain.InventoryStatus(input.Body.Status)
	}

	if err := item.Validate(); err != nil {
		return nil, huma.Error422UnprocessableEntity(err.Error())
	}

	err = a.inventoryRepo.CreateOrUpdate(ctx, &item)
	if err != nil {
		return nil, err
	}

	updatedItem, err := a.inventoryRepo.GetByID(ctx, input.ID, input.UserID)
	if err != nil {
		return nil, err
	}

	return &UpdateInventoryItemOutput{Body: InventoryItemResponse{
		ID:        updatedItem.ID,
		Name:      updatedItem.Name,
		Category:  updatedItem.Category,
		Type:      updatedItem.Type,
		Quantity:  updatedItem.Quantity,
		Unit:      updatedItem.Unit,
		DateAdded: updatedItem.DateAdded,
		Status:    string(updatedItem.Status),
		CreatedAt: updatedItem.CreatedAt,
		UpdatedAt: updatedItem.UpdatedAt,
	}}, nil
}

type DeleteInventoryItemInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	UserID string `header:"user_id" required:"true" example:"user-uuid"`
	ID     string `path:"id"`
}

type DeleteInventoryItemOutput struct {
	Body struct {
		Message string `json:"message"`
	}
}

func (a *api) deleteInventoryItemHandler(ctx context.Context, input *DeleteInventoryItemInput) (*DeleteInventoryItemOutput, error) {
	err := a.inventoryRepo.Delete(ctx, input.ID, input.UserID)
	if err != nil {
		return nil, err
	}

	return &DeleteInventoryItemOutput{Body: struct {
		Message string `json:"message"`
	}{Message: "Inventory item deleted successfully"}}, nil
}
