package api

import (
	"context"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/forfarm/backend/internal/services"
	"github.com/go-chi/chi/v5"
	"github.com/google/generative-ai-go/genai"
)

func (a *api) registerChatRoutes(_ chi.Router, apiInstance huma.API) {
	tags := []string{"chat"}

	huma.Register(apiInstance, huma.Operation{
		OperationID: "chatWithAssistantContextual",
		Method:      http.MethodPost,
		Path:        "/chat/specific",
		Tags:        tags,
		Summary:     "Send a message to the assistant with farm/crop context",
		Description: "Allows users to interact with the AI chatbot, providing farm/crop context.",
	}, a.chatHandler)

	huma.Register(apiInstance, huma.Operation{
		OperationID: "chatWithAssistantGeneral",
		Method:      http.MethodPost,
		Path:        "/chat",
		Tags:        tags,
		Summary:     "Send a message to the general farming assistant",
		Description: "Allows users to interact with the AI chatbot without specific farm/crop context.",
	}, a.generalChatHandler)
}

type HistoryItem struct {
	Role string `json:"role" example:"user" enum:"user,model" doc:"Role of the sender (user or model)"`
	Text string `json:"text" doc:"The content of the message"`
}

type ChatInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	Body   struct {
		Message string        `json:"message" required:"true" doc:"The user's message to the assistant"`
		FarmID  string        `json:"farmId,omitempty" doc:"Optional UUID of the farm context"`
		CropID  string        `json:"cropId,omitempty" doc:"Optional UUID of the crop context"`
		History []HistoryItem `json:"history,omitempty" doc:"Previous turns in the conversation"`
	}
}

type ChatOutput struct {
	Body struct {
		Response string `json:"response" doc:"The assistant's response message"`
	}
}

type GeneralChatInput struct {
	Header string `header:"Authorization" required:"true" example:"Bearer token"`
	Body   struct {
		Message string        `json:"message" required:"true" doc:"The user's message to the assistant"`
		History []HistoryItem `json:"history,omitempty" doc:"Previous turns in the conversation"`
	}
}

type GeneralChatOutput = ChatOutput

// convertInputHistory converts the API HistoryItem slice to genai.Content slice.
func convertInputHistory(apiHistory []HistoryItem) []*genai.Content {
	if apiHistory == nil {
		return nil
	}
	genaiHistory := make([]*genai.Content, 0, len(apiHistory))
	for _, item := range apiHistory {
		if (item.Role == "user" || item.Role == "model") && item.Text != "" {
			content := &genai.Content{
				Role:  item.Role,
				Parts: []genai.Part{genai.Text(item.Text)},
			}
			genaiHistory = append(genaiHistory, content)
		}
	}
	return genaiHistory
}

func (a *api) chatHandler(ctx context.Context, input *ChatInput) (*ChatOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}
	if a.chatService == nil {
		a.logger.Error("Chat service is not initialized")
		return nil, huma.Error500InternalServerError("Chat service is not available")
	}

	genaiHistory := convertInputHistory(input.Body.History)

	serviceInput := services.GenerateResponseInput{
		UserID:  userID,
		Message: input.Body.Message,
		FarmID:  input.Body.FarmID,
		CropID:  input.Body.CropID,
		History: genaiHistory,
	}

	botResponse, err := a.chatService.GenerateResponse(ctx, serviceInput)
	if err != nil {
		a.logger.Error("Failed to get response from chat service (contextual)", "userId", userID, "farmId", input.Body.FarmID, "cropId", input.Body.CropID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to get response from assistant")
	}

	resp := &ChatOutput{}
	resp.Body.Response = botResponse
	return resp, nil
}

func (a *api) generalChatHandler(ctx context.Context, input *GeneralChatInput) (*GeneralChatOutput, error) {
	userID, err := a.getUserIDFromHeader(input.Header)
	if err != nil {
		return nil, huma.Error401Unauthorized("Authentication failed", err)
	}
	if a.chatService == nil {
		a.logger.Error("Chat service is not initialized")
		return nil, huma.Error500InternalServerError("Chat service is not available")
	}

	genaiHistory := convertInputHistory(input.Body.History)

	serviceInput := services.GenerateResponseInput{
		UserID:  userID,
		Message: input.Body.Message,
		History: genaiHistory,
	}

	botResponse, err := a.chatService.GenerateResponse(ctx, serviceInput)
	if err != nil {
		a.logger.Error("Failed to get response from chat service (general)", "userId", userID, "error", err)
		return nil, huma.Error500InternalServerError("Failed to get response from assistant")
	}

	resp := &GeneralChatOutput{}
	resp.Body.Response = botResponse
	return resp, nil
}
