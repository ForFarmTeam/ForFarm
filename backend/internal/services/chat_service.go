package services

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"math/rand"
	"strings"
	"time"

	"github.com/forfarm/backend/internal/config"
	"github.com/forfarm/backend/internal/domain"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type ChatService struct {
	client        *genai.Client
	logger        *slog.Logger
	analyticsRepo domain.AnalyticsRepository
	farmRepo      domain.FarmRepository
	cropRepo      domain.CroplandRepository
	inventoryRepo domain.InventoryRepository
	plantRepo     domain.PlantRepository
}

func NewChatService(
	logger *slog.Logger,
	analyticsRepo domain.AnalyticsRepository,
	farmRepo domain.FarmRepository,
	cropRepo domain.CroplandRepository,
	inventoryRepo domain.InventoryRepository,
	plantRepo domain.PlantRepository,
) (*ChatService, error) {
	if config.GEMINI_API_KEY == "" {
		logger.Warn("GEMINI_API_KEY not set, ChatService will not function.")
		return &ChatService{client: nil, logger: logger}, nil
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(config.GEMINI_API_KEY))
	if err != nil {
		logger.Error("Failed to create Gemini client", "error", err)
		return nil, fmt.Errorf("error creating genai client: %w", err)
	}

	logger.Info("Gemini client initialized successfully")
	return &ChatService{
		client:        client,
		logger:        logger,
		analyticsRepo: analyticsRepo,
		farmRepo:      farmRepo,
		cropRepo:      cropRepo,
		inventoryRepo: inventoryRepo,
		plantRepo:     plantRepo,
	}, nil
}

type GenerateResponseInput struct {
	UserID  string
	Message string
	FarmID  string
	CropID  string
	History []*genai.Content
}

// --- Context Building Helpers ---

func (s *ChatService) buildCropContextString(ctx context.Context, cropID, userID string) (string, error) {
	var contextBuilder strings.Builder
	contextBuilder.WriteString("## Current Crop & Plant Context ##\n")

	cropAnalytics, err := s.analyticsRepo.GetCropAnalytics(ctx, cropID)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			s.logger.Warn("Crop analytics not found for context", "cropId", cropID)
			return "", fmt.Errorf("crop not found")
		}
		s.logger.Error("Failed to fetch crop analytics context", "cropId", cropID, "error", err)
		contextBuilder.WriteString(fmt.Sprintf("Error fetching crop details for ID %s.\n", cropID))
		return "", fmt.Errorf("failed to fetch crop details")
	}

	farm, err := s.farmRepo.GetByID(ctx, cropAnalytics.FarmID)
	if err != nil || farm.OwnerID != userID {
		s.logger.Warn("Ownership check failed for crop context", "cropId", cropID, "farmId", cropAnalytics.FarmID, "userId", userID)
		return "", fmt.Errorf("unauthorized access to crop data")
	}

	fmt.Fprintf(&contextBuilder, "Crop Name: %s (ID: %s)\n", cropAnalytics.CropName, cropAnalytics.CropID)
	fmt.Fprintf(&contextBuilder, "Farm: %s (ID: %s)\n", farm.Name, cropAnalytics.FarmID)
	fmt.Fprintf(&contextBuilder, "Plant: %s (Variety: %s)\n", cropAnalytics.PlantName, safeString(cropAnalytics.Variety))
	fmt.Fprintf(&contextBuilder, "Status: %s\n", cropAnalytics.CurrentStatus)
	fmt.Fprintf(&contextBuilder, "Growth Stage: %s\n", cropAnalytics.GrowthStage)
	fmt.Fprintf(&contextBuilder, "Land Size: %.2f ha\n", cropAnalytics.LandSize)
	fmt.Fprintf(&contextBuilder, "Growth Progress: %d%%\n", cropAnalytics.GrowthProgress)
	if cropAnalytics.PlantHealth != nil {
		fmt.Fprintf(&contextBuilder, "Health Status: %s\n", *cropAnalytics.PlantHealth)
	}
	if cropAnalytics.Temperature != nil {
		fmt.Fprintf(&contextBuilder, "Temperature: %.1f°C\n", *cropAnalytics.Temperature)
	}
	if cropAnalytics.Humidity != nil {
		fmt.Fprintf(&contextBuilder, "Humidity: %.0f%%\n", *cropAnalytics.Humidity)
	}
	if cropAnalytics.SoilMoisture != nil {
		fmt.Fprintf(&contextBuilder, "Soil Moisture: %.0f%%\n", *cropAnalytics.SoilMoisture)
	}
	if cropAnalytics.Rainfall != nil {
		fmt.Fprintf(&contextBuilder, "Rainfall (1h): %.1f mm\n", *cropAnalytics.Rainfall)
	}
	if cropAnalytics.WindSpeed != nil {
		fmt.Fprintf(&contextBuilder, "Wind Speed: %.1f m/s\n", *cropAnalytics.WindSpeed)
	}
	if cropAnalytics.Sunlight != nil {
		fmt.Fprintf(&contextBuilder, "Sunlight Exposure: %.0f%%\n", *cropAnalytics.Sunlight)
	}
	if cropAnalytics.NutrientLevels != nil {
		contextBuilder.WriteString("Nutrients: ")
		nutrients := []string{}
		if cropAnalytics.NutrientLevels.Nitrogen != nil {
			nutrients = append(nutrients, fmt.Sprintf("N=%.0f%%", *cropAnalytics.NutrientLevels.Nitrogen))
		}
		if cropAnalytics.NutrientLevels.Phosphorus != nil {
			nutrients = append(nutrients, fmt.Sprintf("P=%.0f%%", *cropAnalytics.NutrientLevels.Phosphorus))
		}
		if cropAnalytics.NutrientLevels.Potassium != nil {
			nutrients = append(nutrients, fmt.Sprintf("K=%.0f%%", *cropAnalytics.NutrientLevels.Potassium))
		}
		if len(nutrients) > 0 {
			contextBuilder.WriteString(strings.Join(nutrients, ", "))
		} else {
			contextBuilder.WriteString("Not Available")
		}
		contextBuilder.WriteString("\n")
	}
	if cropAnalytics.NextAction != nil {
		dueStr := ""
		if cropAnalytics.NextActionDue != nil {
			dueStr = fmt.Sprintf(" (Due: %s)", cropAnalytics.NextActionDue.Format(time.RFC1123))
		}
		fmt.Fprintf(&contextBuilder, "Suggested Next Action: %s%s\n", *cropAnalytics.NextAction, dueStr)
	}
	contextBuilder.WriteString("\n")

	contextBuilder.WriteString("Plant Details:\n")
	plant, err := s.plantRepo.GetByName(ctx, cropAnalytics.PlantName)
	if err != nil {
		s.logger.Warn("Could not fetch plant details for context", "plantId", cropAnalytics.PlantName, "error", err)
		fmt.Fprintf(&contextBuilder, "  - Could not retrieve plant details.\n")
	} else {
		fmt.Fprintf(&contextBuilder, "  - Type: %s (Variety: %s)\n", plant.Name, safeString(plant.Variety))
		if plant.DaysToMaturity != nil {
			fmt.Fprintf(&contextBuilder, "  - Days to Maturity: ~%d\n", *plant.DaysToMaturity)
		}
		if plant.OptimalTemp != nil {
			fmt.Fprintf(&contextBuilder, "  - Optimal Temp: %.1f°C\n", *plant.OptimalTemp)
		}
		if plant.WaterNeeds != nil {
			fmt.Fprintf(&contextBuilder, "  - Water Needs: %.1f (units unspecified)\n", *plant.WaterNeeds)
		}
		if plant.PHValue != nil {
			fmt.Fprintf(&contextBuilder, "  - Soil pH: %.1f\n", *plant.PHValue)
		}
		if plant.RowSpacing != nil {
			fmt.Fprintf(&contextBuilder, "  - Row Spacing: %.1f (units unspecified)\n", *plant.RowSpacing)
		}
		if plant.PlantingDepth != nil {
			fmt.Fprintf(&contextBuilder, "  - Planting Depth: %.1f (units unspecified)\n", *plant.PlantingDepth)
		}
	}

	contextBuilder.WriteString("\n")

	inventoryContext, _ := s.buildInventoryContextString(ctx, userID)
	contextBuilder.WriteString(inventoryContext)

	return contextBuilder.String(), nil
}

func (s *ChatService) buildFarmContextString(ctx context.Context, farmID, userID string) (string, error) {
	var contextBuilder strings.Builder
	contextBuilder.WriteString("## Current Farm Context ##\n")

	farmAnalytics, err := s.analyticsRepo.GetFarmAnalytics(ctx, farmID)
	if err != nil || farmAnalytics.OwnerID != userID {
		if errors.Is(err, domain.ErrNotFound) || farmAnalytics == nil || farmAnalytics.OwnerID != userID {
			s.logger.Warn("Farm analytics not found or ownership mismatch for context", "farmId", farmID, "userId", userID)
			return "", fmt.Errorf("farm not found or access denied")
		}
		s.logger.Error("Failed to fetch farm analytics context", "farmId", farmID, "error", err)
		return "", fmt.Errorf("failed to fetch farm details")
	}

	fmt.Fprintf(&contextBuilder, "Farm Name: %s (ID: %s)\n", farmAnalytics.FarmName, farmAnalytics.FarmID)
	if farmAnalytics.FarmType != nil {
		fmt.Fprintf(&contextBuilder, "Type: %s\n", *farmAnalytics.FarmType)
	}
	if farmAnalytics.TotalSize != nil {
		fmt.Fprintf(&contextBuilder, "Size: %s\n", *farmAnalytics.TotalSize)
	}
	fmt.Fprintf(&contextBuilder, "Location: Lat %.4f, Lon %.4f\n", farmAnalytics.Latitude, farmAnalytics.Longitude)
	if farmAnalytics.OverallStatus != nil {
		fmt.Fprintf(&contextBuilder, "Overall Status: %s\n", *farmAnalytics.OverallStatus)
	}
	if farmAnalytics.Weather != nil {
		contextBuilder.WriteString("Weather:\n")
		if farmAnalytics.Weather.TempCelsius != nil {
			fmt.Fprintf(&contextBuilder, "  - Temp: %.1f°C\n", *farmAnalytics.Weather.TempCelsius)
		}
		if farmAnalytics.Weather.Humidity != nil {
			fmt.Fprintf(&contextBuilder, "  - Humidity: %.0f%%\n", *farmAnalytics.Weather.Humidity)
		}
		if farmAnalytics.Weather.Description != nil {
			fmt.Fprintf(&contextBuilder, "  - Condition: %s\n", *farmAnalytics.Weather.Description)
		}
		if farmAnalytics.Weather.WindSpeed != nil {
			fmt.Fprintf(&contextBuilder, "  - Wind: %.1f m/s\n", *farmAnalytics.Weather.WindSpeed)
		}
		if farmAnalytics.Weather.RainVolume1h != nil {
			fmt.Fprintf(&contextBuilder, "  - Rain (1h): %.1f mm\n", *farmAnalytics.Weather.RainVolume1h)
		}
		if farmAnalytics.Weather.WeatherLastUpdated != nil {
			fmt.Fprintf(&contextBuilder, "  - Last Updated: %s\n", farmAnalytics.Weather.WeatherLastUpdated.Format(time.RFC1123))
		}
	}

	crops, err := s.cropRepo.GetByFarmID(ctx, farmID)
	if err == nil && len(crops) > 0 {
		contextBuilder.WriteString("Crops on Farm:\n")
		for i, crop := range crops {
			if i >= 5 {
				fmt.Fprintf(&contextBuilder, "  - ... and %d more\n", len(crops)-5)
				break
			}
			fmt.Fprintf(&contextBuilder, "  - %s (Status: %s, Stage: %s)\n", crop.Name, crop.Status, crop.GrowthStage)
		}
	} else if err != nil {
		s.logger.Warn("Failed to fetch crops for farm context", "farmId", farmID, "error", err)
	}

	contextBuilder.WriteString("\n")
	inventoryContext, _ := s.buildInventoryContextString(ctx, userID)
	contextBuilder.WriteString(inventoryContext)

	return contextBuilder.String(), nil
}

func (s *ChatService) buildInventoryContextString(ctx context.Context, userID string) (string, error) {
	var contextBuilder strings.Builder
	contextBuilder.WriteString("## Inventory Summary ##\n")

	filter := domain.InventoryFilter{UserID: userID}
	sort := domain.InventorySort{Field: "name", Direction: "asc"}
	items, err := s.inventoryRepo.GetByUserID(ctx, userID, filter, sort)
	if err != nil {
		s.logger.Warn("Failed to fetch inventory for context", "userId", userID, "error", err)
		fmt.Fprintf(&contextBuilder, "Could not retrieve inventory details.\n")
		return contextBuilder.String(), err
	}

	if len(items) == 0 {
		fmt.Fprintf(&contextBuilder, "No inventory items found.\n")
		return contextBuilder.String(), nil
	}

	lowStockCount := 0
	fmt.Fprintf(&contextBuilder, "Items (%d total):\n", len(items))
	limit := 10
	for i, item := range items {
		if i >= limit {
			fmt.Fprintf(&contextBuilder, "- ... and %d more\n", len(items)-limit)
			break
		}
		statusName := item.Status.Name
		if statusName == "" && item.StatusID != 0 {
			statusName = fmt.Sprintf("StatusID %d", item.StatusID)
		}
		unitName := item.Unit.Name
		if unitName == "" && item.UnitID != 0 {
			unitName = fmt.Sprintf("UnitID %d", item.UnitID)
		}

		fmt.Fprintf(&contextBuilder, "- %s: %.2f %s (Status: %s)\n", item.Name, item.Quantity, unitName, statusName)
		if strings.Contains(strings.ToLower(statusName), "low") {
			lowStockCount++
		}
	}
	if lowStockCount > 0 {
		fmt.Fprintf(&contextBuilder, "Note: %d item(s) are low on stock.\n", lowStockCount)
	}

	return contextBuilder.String(), nil
}

func (s *ChatService) buildGeneralContextString(ctx context.Context, userID string) (string, error) {
	var contextBuilder strings.Builder
	contextBuilder.WriteString("## General Farming Context ##\n")

	farms, err := s.farmRepo.GetByOwnerID(ctx, userID)
	if err == nil && len(farms) > 0 {
		contextBuilder.WriteString("Your Farms:\n")
		for i, farm := range farms {
			if i >= 5 {
				fmt.Fprintf(&contextBuilder, "- ... and %d more\n", len(farms)-5)
				break
			}
			fmt.Fprintf(&contextBuilder, "- %s (Type: %s, Size: %s)\n", farm.Name, farm.FarmType, farm.TotalSize)
		}
	} else if err != nil {
		s.logger.Warn("Failed to fetch farms for general context", "userId", userID, "error", err)
	} else {
		contextBuilder.WriteString("No farms found for your account.\n")
	}
	contextBuilder.WriteString("\n")

	inventoryContext, _ := s.buildInventoryContextString(ctx, userID)
	contextBuilder.WriteString(inventoryContext)

	return contextBuilder.String(), nil
}

func (s *ChatService) GenerateResponse(ctx context.Context, input GenerateResponseInput) (string, error) {
	var contextString string
	var contextErr error
	startTime := time.Now()

	if input.CropID != "" {
		s.logger.Debug("Building context for CROP", "cropId", input.CropID)
		contextString, contextErr = s.buildCropContextString(ctx, input.CropID, input.UserID)
	} else if input.FarmID != "" {
		s.logger.Debug("Building context for FARM", "farmId", input.FarmID)
		contextString, contextErr = s.buildFarmContextString(ctx, input.FarmID, input.UserID)
	} else {
		s.logger.Debug("Building GENERAL context", "userId", input.UserID)
		contextString, contextErr = s.buildGeneralContextString(ctx, input.UserID)
	}

	newsContext, _ := s.retrieveDummyNews(ctx)
	weatherOutlook, _ := s.retrieveDummyWeatherOutlook(ctx, input.FarmID)

	fullContext := strings.Builder{}
	fullContext.WriteString(contextString)
	if contextErr != nil {
		s.logger.Warn("Error building primary context string", "error", contextErr, "userId", input.UserID, "farmId", input.FarmID, "cropId", input.CropID)
		fullContext.WriteString(fmt.Sprintf("Warning: Could not retrieve specific data (%s).\n\n", contextErr))
	}
	fullContext.WriteString(newsContext)
	fullContext.WriteString(weatherOutlook)

	contextDuration := time.Since(startTime)
	s.logger.Debug("Context retrieval duration", "duration", contextDuration)

	model := s.client.GenerativeModel("gemini-1.5-flash")
	systemInstruction := `You are ForFarm Assistant, an expert AI specialized in agriculture and farming practices.
	Your goal is to provide helpful, accurate, and concise advice to farmers using the ForFarm platform.
	Use the provided context data about the user's specific farm, crops, or inventory when available to tailor your response.
	If context is provided, prioritize answering based on that context.
	If no specific context is available or relevant, provide general best-practice farming advice.
	Focus on actionable recommendations where appropriate.
	Keep responses focused on farming, agriculture, crop management, pest control, soil health, weather impacts, and inventory management.`
	model.SystemInstruction = &genai.Content{Parts: []genai.Part{genai.Text(systemInstruction)}}
	fullPrompt := fmt.Sprintf("%s\nUser Question: %s", strings.TrimSpace(fullContext.String()), input.Message)

	session := model.StartChat()
	session.History = input.History

	s.logger.Info("Sending message to LLM", "userId", input.UserID, "historyLength", len(session.History), "contextLength", len(fullContext.String()))

	resp, err := session.SendMessage(ctx, genai.Text(fullPrompt))
	llmDuration := time.Since(startTime) - contextDuration
	s.logger.Debug("LLM response duration", "duration", llmDuration)

	if err != nil {
		s.logger.Error("Error sending message to Gemini", "error", err)
		return "Sorry, I encountered an error while generating a response.", fmt.Errorf("LLM communication failed: %w", err)
	}

	var responseText strings.Builder
	if len(resp.Candidates) > 0 && resp.Candidates[0].Content != nil {
		for _, part := range resp.Candidates[0].Content.Parts {
			if txt, ok := part.(genai.Text); ok {
				responseText.WriteString(string(txt))
			}
		}
	}

	if responseText.Len() == 0 {
		s.logger.Warn("Received no valid text content from Gemini", "finishReason", resp.Candidates[0].FinishReason)
		if resp.Candidates[0].FinishReason != genai.FinishReasonStop {
			return fmt.Sprintf("My response generation was interrupted (%s). Could you please try rephrasing?", resp.Candidates[0].FinishReason), nil
		}
		return "I apologize, I couldn't generate a response for that request.", nil
	}

	s.logger.Info("Successfully generated chat response", "userId", input.UserID, "responseLength", responseText.Len())
	return responseText.String(), nil
}

// Simulates fetching news with artificial delay and random selection
func (s *ChatService) retrieveDummyNews(ctx context.Context) (string, error) {
	s.logger.Debug("Retrieving dummy news context")
	time.Sleep(50 * time.Millisecond)
	if rand.Intn(10) > 2 {
		newsItems := []string{
			"Global wheat prices show slight increase.",
			"New organic pest control method using beneficial nematodes gaining traction.",
			"Research highlights drought-resistant corn variety performance.",
			"Government announces new subsidies for sustainable farming practices.",
		}
		return fmt.Sprintf("## Recent Agricultural News ##\n- %s\n\n", newsItems[rand.Intn(len(newsItems))]), nil
	}
	return "", nil
}

// Simulates fetching weather forecast with artificial delay and random selection
func (s *ChatService) retrieveDummyWeatherOutlook(ctx context.Context, farmID string) (string, error) {
	s.logger.Debug("Retrieving dummy weather outlook context", "farmId", farmID)
	time.Sleep(80 * time.Millisecond)
	forecasts := []string{
		"Clear skies expected for the next 3 days.",
		"Chance of scattered showers tomorrow afternoon.",
		"Temperature expected to rise towards the weekend.",
		"Slightly higher winds predicted for Thursday.",
	}
	return fmt.Sprintf("## Weather Outlook ##\n- %s\n\n", forecasts[rand.Intn(len(forecasts))]), nil
}

func safeString(s *string) string {
	if s == nil {
		return "N/A"
	}
	return *s
}

func (s *ChatService) Close() {
	if s.client != nil {
		if err := s.client.Close(); err != nil {
			s.logger.Error("Failed to close Gemini client", "error", err)
		} else {
			s.logger.Info("Gemini client closed.")
		}
	}
}
