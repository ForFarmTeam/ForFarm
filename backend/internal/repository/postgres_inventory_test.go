package repository_test

import (
	"context"
	"errors"
	"strconv"
	"testing"
	"time"

	"github.com/forfarm/backend/internal/domain"
	"github.com/forfarm/backend/internal/repository"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockConnection is a mock implementation of the repository.Connection interface.
type MockConnection struct {
	mock.Mock
}

func (m *MockConnection) Exec(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
	callArgs := []interface{}{ctx, query}
	callArgs = append(callArgs, args...)
	ret := m.Called(callArgs...)
	return ret.Get(0).(pgconn.CommandTag), ret.Error(1)
}

func (m *MockConnection) Query(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
	callArgs := []interface{}{ctx, query}
	callArgs = append(callArgs, args...)
	ret := m.Called(callArgs...)
	rows, _ := ret.Get(0).(pgx.Rows)
	return rows, ret.Error(1)
}

func (m *MockConnection) QueryRow(ctx context.Context, query string, args ...interface{}) pgx.Row {
	callArgs := []interface{}{ctx, query}
	callArgs = append(callArgs, args...)
	ret := m.Called(callArgs...)
	return ret.Get(0).(pgx.Row)
}

func (m *MockConnection) BeginTx(ctx context.Context, txOptions pgx.TxOptions) (pgx.Tx, error) {
	ret := m.Called(ctx, txOptions)
	return ret.Get(0).(pgx.Tx), ret.Error(1)
}

// MockRows is a mock implementation of pgx.Rows
type MockRows struct {
	mock.Mock
	currentIndex int
	data         []map[string]interface{}
	columns      []string
	err          error
}

func (m *MockRows) Next() bool {
	m.Called()
	if m.err != nil {
		return false
	}
	m.currentIndex++
	return m.currentIndex <= len(m.data)
}

func (m *MockRows) Scan(dest ...interface{}) error {
	args := m.Called(dest...)
	if args.Error(0) != nil {
		return args.Error(0)
	}

	if m.currentIndex > len(m.data) || m.currentIndex == 0 {
		return errors.New("scan called out of bounds")
	}

	currentRow := m.data[m.currentIndex-1]
	for i, d := range dest {
		colName := strconv.Itoa(i)
		if len(m.columns) > i {
			colName = m.columns[i]
		}
		if val, ok := currentRow[colName]; ok {
			switch ptr := d.(type) {
			case *string:
				*ptr = val.(string)
			case *int:
				*ptr = val.(int)
			case *float64:
				*ptr = val.(float64)
			case *time.Time:
				*ptr = val.(time.Time)
			}
		}
	}

	return nil
}

func (m *MockRows) Close() {
	m.Called()
}

func (m *MockRows) Err() error {
	args := m.Called()
	if args.Error(0) != nil {
		return args.Error(0)
	}
	return m.err
}

func (m *MockRows) CommandTag() pgconn.CommandTag {
	return pgconn.CommandTag{}
}

func (m *MockRows) Conn() *pgx.Conn {
	return nil
}

func (m *MockRows) FieldDescriptions() []pgconn.FieldDescription {
	return nil
}

func (m *MockRows) RawValues() [][]byte {
	return nil
}

func (m *MockRows) Values() ([]interface{}, error) {
	return nil, nil
}

// MockEventPublisher is a mock implementation of the domain.EventPublisher interface.
type MockEventPublisher struct {
	mock.Mock
}

func (m *MockEventPublisher) Publish(ctx context.Context, event domain.Event) error {
	args := m.Called(ctx, event)
	return args.Error(0)
}

// TestGetByID tests the GetByID function of the inventory repository.
func TestGetByID(t *testing.T) {
	mockConn := new(MockConnection)
	mockRows := new(MockRows)
	inventoryRepo := repository.NewPostgresInventory(mockConn, nil, nil)

	testID := uuid.New().String()
	testUserID := uuid.New().String()

	columns := []string{"id", "user_id", "name", "category_id", "quantity", "unit_id", "date_added", "status_id", "created_at", "updated_at", "category_name", "status_name", "unit_name"}

	t.Run("success", func(t *testing.T) {
		// Test: Successful retrieval of an inventory item by ID.
		mockRows.On("Next").Return(true).Once()
		mockRows.On("Scan", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
		mockRows.On("Close").Return().Once()
		mockRows.On("Err").Return(nil).Once()
		mockRows.On("CommandTag").Return(pgconn.CommandTag{}).Once()
		mockRows.On("FieldDescriptions").Return([]pgconn.FieldDescription{}).Once()
		mockRows.On("RawValues").Return([][]byte{}).Once()
		mockRows.On("Values").Return([]interface{}{}, nil).Once()

		mockConn.On("Query", mock.Anything, mock.AnythingOfType("string"), testID, testUserID).Return(mockRows, nil).Once()

		mockRows.data = []map[string]interface{}{
			{
				"id":            testID,
				"user_id":       testUserID,
				"name":          "Test Item",
				"category_id":   1,
				"quantity":      10.5,
				"unit_id":       1,
				"date_added":    time.Now(),
				"status_id":     1,
				"created_at":    time.Now(),
				"updated_at":    time.Now(),
				"category_name": "Category Name",
				"status_name":   "Status Name",
				"unit_name":     "Unit Name",
			},
		}
		mockRows.columns = columns

		item, err := inventoryRepo.GetByID(context.Background(), testID, testUserID)
		assert.NoError(t, err)
		assert.Equal(t, testID, item.ID)
		mockConn.AssertExpectations(t)
	})

	t.Run("not found", func(t *testing.T) {
		// Test: Item not found scenario.
		mockRows.On("Next").Return(false).Once()
		mockRows.On("Close").Return().Once()
		mockRows.On("Err").Return(nil).Once()
		mockRows.On("CommandTag").Return(pgconn.CommandTag{}).Once()
		mockRows.On("FieldDescriptions").Return([]pgconn.FieldDescription{}).Once()
		mockRows.On("RawValues").Return([][]byte{}).Once()
		mockRows.On("Values").Return([]interface{}{}, nil).Once()

		mockConn.On("Query", mock.Anything, mock.AnythingOfType("string"), testID, testUserID).Return(mockRows, nil).Once()

		_, err := inventoryRepo.GetByID(context.Background(), testID, testUserID)
		assert.ErrorIs(t, err, domain.ErrNotFound)
		mockConn.AssertExpectations(t)
	})

	t.Run("query error", func(t *testing.T) {
		// Test: Database query returns an error.
		mockConn.On("Query", mock.Anything, mock.AnythingOfType("string"), testID, testUserID).Return(nil, errors.New("database error")).Once()

		_, err := inventoryRepo.GetByID(context.Background(), testID, testUserID)
		assert.Error(t, err)
		mockConn.AssertExpectations(t)
	})

	t.Run("scan error", func(t *testing.T) {
		// Test: Error during row scanning.
		mockRows.On("Next").Return(true).Once()
		mockRows.On("Scan", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("scan error")).Once()
		mockRows.On("Close").Return().Once()
		mockRows.On("Err").Return(nil).Once()
		mockRows.On("CommandTag").Return(pgconn.CommandTag{}).Once()
		mockRows.On("FieldDescriptions").Return([]pgconn.FieldDescription{}).Once()
		mockRows.On("RawValues").Return([][]byte{}).Once()
		mockRows.On("Values").Return([]interface{}{}, nil).Once()

		mockConn.On("Query", mock.Anything, mock.AnythingOfType("string"), testID, testUserID).Return(mockRows, nil).Once()

		_, err := inventoryRepo.GetByID(context.Background(), testID, testUserID)
		assert.Error(t, err)
		mockConn.AssertExpectations(t)
	})

}
