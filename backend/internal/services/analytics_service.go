package services

import (
	"math/rand"
	"time"

	"github.com/forfarm/backend/internal/domain"
)

// AnalyticsService provides methods for calculating or deriving analytics data.
// For now, it contains dummy implementations.
type AnalyticsService struct {
	// Add dependencies like repositories if needed for real logic later
}

// NewAnalyticsService creates a new AnalyticsService.
func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{}
}

// CalculatePlantHealth provides a dummy health status.
// TODO: Implement real health calculation based on status, weather, events, etc.
func (s *AnalyticsService) CalculatePlantHealth(status string, growthStage string) string {
	// Simple dummy logic
	switch status {
	case "Problem", "Diseased", "Infested":
		return "warning"
	case "Fallow", "Harvested":
		return "n/a" // Or maybe 'good' if fallow is considered healthy state
	default:
		// Slightly randomize for demo purposes
		if rand.Intn(10) < 2 { // 20% chance of warning even if status is 'growing'
			return "warning"
		}
		return "good"
	}
}

// SuggestNextAction provides a dummy next action based on growth stage.
// TODO: Implement real suggestion logic based on stage, weather, history, plant type etc.
func (s *AnalyticsService) SuggestNextAction(growthStage string, lastUpdated time.Time) (action *string, dueDate *time.Time) {
	// Default action
	nextActionStr := "Monitor crop health"
	nextDueDate := time.Now().Add(24 * time.Hour) // Check tomorrow

	switch growthStage {
	case "Planned", "Planting":
		nextActionStr = "Prepare soil and planting"
		nextDueDate = time.Now().Add(12 * time.Hour)
	case "Germination", "Seedling":
		nextActionStr = "Check for germination success and early pests"
		nextDueDate = time.Now().Add(48 * time.Hour)
	case "Vegetative":
		nextActionStr = "Monitor growth and apply nutrients if needed"
		nextDueDate = time.Now().Add(72 * time.Hour)
	case "Flowering", "Budding":
		nextActionStr = "Check pollination and manage pests/diseases"
		nextDueDate = time.Now().Add(48 * time.Hour)
	case "Fruiting", "Ripening":
		nextActionStr = "Monitor fruit development and prepare for harvest"
		nextDueDate = time.Now().Add(7 * 24 * time.Hour) // Check in a week
	case "Harvesting":
		nextActionStr = "Proceed with harvest"
		nextDueDate = time.Now().Add(24 * time.Hour)
	}

	// Only return if the suggestion is "newer" than the last update to avoid constant same suggestion
	// This is basic logic, real implementation would be more complex
	if nextDueDate.After(lastUpdated.Add(1 * time.Hour)) { // Only suggest if due date is >1hr after last update
		return &nextActionStr, &nextDueDate
	}

	return nil, nil // No immediate action needed or suggestion is old
}

// GetNutrientLevels provides dummy nutrient levels.
// TODO: Implement real nutrient level fetching (e.g., from soil sensors, lab results events).
func (s *AnalyticsService) GetNutrientLevels(cropID string) *struct {
	Nitrogen   *float64 `json:"nitrogen,omitempty"`
	Phosphorus *float64 `json:"phosphorus,omitempty"`
	Potassium  *float64 `json:"potassium,omitempty"`
} {
	// Return dummy data or nil if unavailable
	if rand.Intn(10) < 7 { // 70% chance of having dummy data
		n := float64(50 + rand.Intn(40)) // 50-89
		p := float64(40 + rand.Intn(40)) // 40-79
		k := float64(45 + rand.Intn(40)) // 45-84
		return &struct {
			Nitrogen   *float64 `json:"nitrogen,omitempty"`
			Phosphorus *float64 `json:"phosphorus,omitempty"`
			Potassium  *float64 `json:"potassium,omitempty"`
		}{
			Nitrogen:   &n,
			Phosphorus: &p,
			Potassium:  &k,
		}
	}
	return nil // Simulate data not available
}

// GetEnvironmentalData attempts to retrieve relevant environmental data.
// TODO: Enhance this - Could query specific weather events for the crop location/timeframe.
// Currently relies on potentially stale FarmAnalytics weather.
func (s *AnalyticsService) GetEnvironmentalData(farmAnalytics *domain.FarmAnalytics) (temp, humidity, wind, rain, sunlight, soilMoisture *float64) {
	// Initialize with nil
	temp, humidity, wind, rain, sunlight, soilMoisture = nil, nil, nil, nil, nil, nil

	// Try to get from FarmAnalytics
	if farmAnalytics != nil && farmAnalytics.Weather != nil {
		temp = farmAnalytics.Weather.TempCelsius
		humidity = farmAnalytics.Weather.Humidity
		wind = farmAnalytics.Weather.WindSpeed
		rain = farmAnalytics.Weather.RainVolume1h
		// Note: Sunlight and SoilMoisture are not typically in basic WeatherData
	}

	// Provide dummy values ONLY if still nil (ensures real data isn't overwritten)
	if temp == nil {
		t := float64(18 + rand.Intn(15)) // 18-32 C
		temp = &t
	}
	if humidity == nil {
		h := float64(40 + rand.Intn(50)) // 40-89 %
		humidity = &h
	}
	if wind == nil {
		w := float64(rand.Intn(15)) // 0-14 m/s
		wind = &w
	}
	if rain == nil {
		// Simulate less frequent rain
		r := 0.0
		if rand.Intn(10) < 2 { // 20% chance of rain
			r = float64(rand.Intn(5)) // 0-4 mm
		}
		rain = &r
	}
	if sunlight == nil {
		sl := float64(60 + rand.Intn(40)) // 60-99 %
		sunlight = &sl
	}
	if soilMoisture == nil {
		sm := float64(30 + rand.Intn(50)) // 30-79 %
		soilMoisture = &sm
	}

	return // Named return values
}
