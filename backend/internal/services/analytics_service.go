package services

import (
	"math/rand"
	"time"

	"github.com/forfarm/backend/internal/domain"
)

type AnalyticsService struct {
}

func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{}
}

func (s *AnalyticsService) CalculatePlantHealth(status string, growthStage string) string {
	switch status {
	case "Problem", "Diseased", "Infested":
		return "warning"
	case "Fallow", "Harvested":
		return "n/a"
	default:
		// 20% chance of warning even if status is 'growing'
		if rand.Intn(10) < 2 {
			return "warning"
		}
		return "good"
	}
}

func (s *AnalyticsService) SuggestNextAction(growthStage string, lastUpdated time.Time) (action *string, dueDate *time.Time) {
	nextActionStr := "Monitor crop health"
	nextDueDate := time.Now().Add(24 * time.Hour)

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
		nextDueDate = time.Now().Add(7 * 24 * time.Hour)
	case "Harvesting":
		nextActionStr = "Proceed with harvest"
		nextDueDate = time.Now().Add(24 * time.Hour)
	}

	// Only suggest if due date is >1hr after last update
	if nextDueDate.After(lastUpdated.Add(1 * time.Hour)) {
		return &nextActionStr, &nextDueDate
	}

	return nil, nil
}

func (s *AnalyticsService) GetNutrientLevels(cropID string) *struct {
	Nitrogen   *float64 `json:"nitrogen,omitempty"`
	Phosphorus *float64 `json:"phosphorus,omitempty"`
	Potassium  *float64 `json:"potassium,omitempty"`
} {
	// 70% chance of having dummy data
	if rand.Intn(10) < 7 {
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
	return nil
}

func (s *AnalyticsService) GetEnvironmentalData(farmAnalytics *domain.FarmAnalytics) (temp, humidity, wind, rain, sunlight, soilMoisture *float64) {
	temp, humidity, wind, rain, sunlight, soilMoisture = nil, nil, nil, nil, nil, nil

	if farmAnalytics != nil && farmAnalytics.Weather != nil {
		temp = farmAnalytics.Weather.TempCelsius
		humidity = farmAnalytics.Weather.Humidity
		wind = farmAnalytics.Weather.WindSpeed
		rain = farmAnalytics.Weather.RainVolume1h
	}

	// Provide dummy values only if data is missing
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

	return
}
