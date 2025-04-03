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

	huma.Register(api, huma.Operation{
		OperationID: "getInventoryStatus",
		Method:      http.MethodGet,
		Path:        prefix + "/status",
		Tags:        tags,
	}, a.getInventoryStatusHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getInventoryCategory",
		Method:      http.MethodGet,
		Path:        prefix + "/category",
		Tags:        tags,
	}, a.getInventoryCategoryHandler)

	huma.Register(api, huma.Operation{
		OperationID: "getHarvestUnits",
		Method:      http.MethodGet,
		Path:        "/harvest/units",
		Tags:        []string{"harvest"},
	}, a.getHarvestUnitsHandler)
}

type InventoryItemResponse struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Category  InventoryCategory `json:"category"`
	Quantity  float64           `json:"quantity"`
	Unit      HarvestUnit       `json:"unit"`
	DateAdded time.Time         `json:"dateAdded"`
	Status    InventoryStatus   `json:"status"`
	CreatedAt time.Time         `json:"createdAt,omitempty"`
	UpdatedAt time.Time         `json:"updatedAt,omitempty"`
}

type InventoryStatus struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type InventoryCategory struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type HarvestUnit struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type CreateInventoryItemInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	Body   struct {
		Name       string    `json:"name" required:"true"`
		CategoryID int       `json:"categoryId" required:"true"`
		Quantity   float64   `json:"quantity" required:"true"`
		UnitID     int       `json:"unitId" required:"true"`
		DateAdded  time.Time `json:"dateAdded" required:"true"`
		StatusID   int       `json:"statusId" required:"true"`
	}
}

type CreateInventoryItemOutput struct {
	Body struct {
		ID string `json:"id"`
	}
}

type UpdateInventoryItemInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	ID     string `path:"id"`
	Body   struct {
		Name       string    `json:"name"`
		CategoryID int       `json:"categoryId"`
		Quantity   float64   `json:"quantity"`
		UnitID     int       `json:"unitId"`
		DateAdded  time.Time `json:"dateAdded"`
		StatusID   int       `json:"statusId"`
	}
}

type UpdateInventoryItemOutput struct {
	Body InventoryItemResponse
}

type GetInventoryItemsInput struct {
	Header      string    `header:"Authorization" required:"true" example:"Bearer token"`
	CategoryID  int       `query:"categoryId"`
	StatusID    int       `query:"statusId"`
	StartDate   time.Time `query:"startDate" format:"date-time"`
	EndDate     time.Time `query:"endDate" format:"date-time"`
	SearchQuery string    `query:"search"`
	SortBy      string    `query:"sortBy" enum:"name,quantity,dateAdded,createdAt"`
	SortOrder   string    `query:"sortOrder" enum:"asc,desc" default:"desc"`
}

type GetInventoryItemsOutput struct {
	Body []InventoryItemResponse
}

type GetInventoryItemInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	UserID string `header:"userId" required:"true" example:"user-uuid"`
	ID     string `path:"id"`
}

type GetInventoryItemOutput struct {
	Body InventoryItemResponse
}

type DeleteInventoryItemInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	UserID string `header:"userId" required:"true" example:"user-uuid"`
	ID     string `path:"id"`
}

type DeleteInventoryItemOutput struct {
	Body struct {
		Message string `json:"message"`
	}
}

type GetInventoryStatusOutput struct {
	Body []InventoryStatus
}

type GetInventoryCategoryOutput struct {
	Body []InventoryCategory
}

type GetHarvestUnitsOutput struct {
	Body []HarvestUnit
}

func (a *api) createInventoryItemHandler(ctx context.Context, input *CreateInventoryItemInput) (*CreateInventoryItemOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	item := &domain.InventoryItem{
		UserID:     userID,
		Name:       input.Body.Name,
		CategoryID: input.Body.CategoryID,
		Quantity:   input.Body.Quantity,
		UnitID:     input.Body.UnitID,
		DateAdded:  input.Body.DateAdded,
		StatusID:   input.Body.StatusID,
	}

	if err := item.Validate(); err != nil {
		return nil, huma.Error422UnprocessableEntity(err.Error())
	}

	err = a.inventoryRepo.CreateOrUpdate(ctx, item)
	if err != nil {
		return nil, err
	}

	return &CreateInventoryItemOutput{Body: struct {
		ID string `json:"id"`
	}{ID: item.ID}}, nil
}

func (a *api) getInventoryItemsByUserHandler(ctx context.Context, input *GetInventoryItemsInput) (*GetInventoryItemsOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	filter := domain.InventoryFilter{
		UserID:      userID,
		CategoryID:  input.CategoryID,
		StatusID:    input.StatusID,
		StartDate:   input.StartDate,
		EndDate:     input.EndDate,
		SearchQuery: input.SearchQuery,
	}

	sort := domain.InventorySort{
		Field:     input.SortBy,
		Direction: input.SortOrder,
	}

	items, err := a.inventoryRepo.GetByUserID(ctx, userID, filter, sort)
	if err != nil {
		return nil, err
	}

	response := make([]InventoryItemResponse, len(items))
	for i, item := range items {
		response[i] = InventoryItemResponse{
			ID:   item.ID,
			Name: item.Name,
			Category: InventoryCategory{
				ID:   item.Category.ID,
				Name: item.Category.Name,
			},
			Quantity: item.Quantity,
			Unit: HarvestUnit{
				ID:   item.Unit.ID,
				Name: item.Unit.Name,
			},
			DateAdded: item.DateAdded,
			Status: InventoryStatus{
				ID:   item.Status.ID,
				Name: item.Status.Name,
			},
			CreatedAt: item.CreatedAt,
			UpdatedAt: item.UpdatedAt,
		}
	}

	return &GetInventoryItemsOutput{Body: response}, nil
}

func (a *api) getInventoryItemHandler(ctx context.Context, input *GetInventoryItemInput) (*GetInventoryItemOutput, error) {
	item, err := a.inventoryRepo.GetByID(ctx, input.ID, input.UserID)
	if err != nil {
		return nil, err
	}

	return &GetInventoryItemOutput{Body: InventoryItemResponse{
		ID:   item.ID,
		Name: item.Name,
		Category: InventoryCategory{
			ID:   item.Category.ID,
			Name: item.Category.Name,
		},
		Quantity: item.Quantity,
		Unit: HarvestUnit{
			ID:   item.Unit.ID,
			Name: item.Unit.Name,
		},
		DateAdded: item.DateAdded,
		Status: InventoryStatus{
			ID:   item.Status.ID,
			Name: item.Status.Name,
		},
		CreatedAt: item.CreatedAt,
		UpdatedAt: item.UpdatedAt,
	}}, nil
}

func (a *api) updateInventoryItemHandler(ctx context.Context, input *UpdateInventoryItemInput) (*UpdateInventoryItemOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	item, err := a.inventoryRepo.GetByID(ctx, input.ID, userID)
	if err != nil {
		return nil, err
	}

	if input.Body.Name != "" {
		item.Name = input.Body.Name
	}
	if input.Body.CategoryID != 0 {
		item.CategoryID = input.Body.CategoryID
	}
	if input.Body.Quantity != 0 {
		item.Quantity = input.Body.Quantity
	}
	if input.Body.UnitID != 0 {
		item.UnitID = input.Body.UnitID
	}
	if !input.Body.DateAdded.IsZero() {
		item.DateAdded = input.Body.DateAdded
	}
	if input.Body.StatusID != 0 {
		item.StatusID = input.Body.StatusID
	}

	if err := item.Validate(); err != nil {
		return nil, huma.Error422UnprocessableEntity(err.Error())
	}

	err = a.inventoryRepo.CreateOrUpdate(ctx, &item)
	if err != nil {
		return nil, err
	}

	updatedItem, err := a.inventoryRepo.GetByID(ctx, input.ID, userID)
	if err != nil {
		return nil, err
	}

	return &UpdateInventoryItemOutput{Body: InventoryItemResponse{
		ID:   updatedItem.ID,
		Name: updatedItem.Name,
		Category: InventoryCategory{
			ID:   updatedItem.Category.ID,
			Name: updatedItem.Category.Name,
		},
		Quantity: updatedItem.Quantity,
		Unit: HarvestUnit{
			ID:   updatedItem.Unit.ID,
			Name: updatedItem.Unit.Name,
		},
		DateAdded: updatedItem.DateAdded,
		Status: InventoryStatus{
			ID:   updatedItem.Status.ID,
			Name: updatedItem.Status.Name,
		},
		CreatedAt: updatedItem.CreatedAt,
		UpdatedAt: updatedItem.UpdatedAt,
	}}, nil
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

func (a *api) getInventoryStatusHandler(ctx context.Context, input *struct{}) (*GetInventoryStatusOutput, error) {
	statuses, err := a.inventoryRepo.GetStatuses(ctx)
	if err != nil {
		return nil, err
	}

	response := make([]InventoryStatus, len(statuses))
	for i, status := range statuses {
		response[i] = InventoryStatus{
			ID:   status.ID,
			Name: status.Name,
		}
	}

	return &GetInventoryStatusOutput{Body: response}, nil
}

func (a *api) getInventoryCategoryHandler(ctx context.Context, input *struct{}) (*GetInventoryCategoryOutput, error) {
	categories, err := a.inventoryRepo.GetCategories(ctx)
	if err != nil {
		return nil, err
	}

	response := make([]InventoryCategory, len(categories))
	for i, category := range categories {
		response[i] = InventoryCategory{
			ID:   category.ID,
			Name: category.Name,
		}
	}

	return &GetInventoryCategoryOutput{Body: response}, nil
}

func (a *api) getHarvestUnitsHandler(ctx context.Context, input *struct{}) (*GetHarvestUnitsOutput, error) {
	units, err := a.harvestRepo.GetUnits(ctx)
	if err != nil {
		return nil, err
	}

	response := make([]HarvestUnit, len(units))
	for i, unit := range units {
		response[i] = HarvestUnit{
			ID:   unit.ID,
			Name: unit.Name,
		}
	}

	return &GetHarvestUnitsOutput{Body: response}, nil
}
