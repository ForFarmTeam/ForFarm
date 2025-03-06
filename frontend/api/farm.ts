import axiosInstance from "./config";
import type { Crop, CropAnalytics, Farm } from "@/types";

/**
 * Fetch a specific crop by id using axios.
 * Falls back to dummy data on error.
 */
export async function fetchCropById(id: string): Promise<Crop> {
  try {
    const response = await axiosInstance.get<Crop>(`/api/crops/${id}`);
    return response.data;
  } catch (error) {
    // Fallback dummy data
    return {
      id,
      farmId: "1",
      name: "Monthong Durian",
      plantedDate: new Date("2024-01-15"),
      status: "growing",
      variety: "Premium Grade",
      expectedHarvest: new Date("2024-07-15"),
      area: "2.5 hectares",
      healthScore: 85,
    };
  }
}

/**
 * Fetch crop analytics by crop id using axios.
 * Returns dummy analytics if the API call fails.
 */
export async function fetchAnalyticsByCropId(id: string): Promise<CropAnalytics> {
  try {
    const response = await axiosInstance.get<CropAnalytics>(`/api/crops/${id}/analytics`);
    return response.data;
  } catch (error) {
    return {
      cropId: id,
      growthProgress: 45,
      humidity: 75,
      temperature: 28,
      sunlight: 85,
      waterLevel: 65,
      plantHealth: "good",
      nextAction: "Water the plant",
      nextActionDue: new Date("2024-02-15"),
      soilMoisture: 70,
      windSpeed: "12 km/h",
      rainfall: "25mm last week",
      nutrientLevels: {
        nitrogen: 80,
        phosphorus: 65,
        potassium: 75,
      },
    };
  }
}

/**
 * Fetch an array of farms using axios.
 * Simulates a delay and a random error; returns dummy data if the API is unavailable.
 */
export async function fetchFarms(): Promise<Farm[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const response = await axiosInstance.get<Farm[]>("/api/farms");
    return response.data;
  } catch (error) {
    // Optionally, you could simulate a random error here. For now we return fallback data.
    return [
      {
        id: "1",
        name: "Green Valley Farm",
        location: "Bangkok",
        type: "durian",
        createdAt: new Date("2023-01-01"),
        area: "12.5 hectares",
        crops: 5,
      },
      {
        id: "2",
        name: "Sunrise Orchard",
        location: "Chiang Mai",
        type: "mango",
        createdAt: new Date("2023-02-15"),
        area: "8.3 hectares",
        crops: 3,
      },
      {
        id: "3",
        name: "Golden Harvest Fields",
        location: "Phuket",
        type: "rice",
        createdAt: new Date("2023-03-22"),
        area: "20.1 hectares",
        crops: 2,
      },
    ];
  }
}

/**
 * Simulates creating a new farm.
 * Waits for 800ms and then uses dummy data.
 */
export async function createFarm(data: Partial<Farm>): Promise<Farm> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  // In a real implementation you might call:
  // const response = await axiosInstance.post<Farm>("/api/farms", data);
  // return response.data;
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: data.name!,
    location: data.location!,
    type: data.type!,
    createdAt: new Date(),
    area: data.area || "0 hectares",
    crops: 0,
  };
}

// Additional functions for fetching crop details remain unchanged...

/**
 * Fetch detailed information for a specific farm (including its crops) using axios.
 * If the API call fails, returns fallback dummy data.
 */
export async function fetchFarmDetails(farmId: string): Promise<{ farm: Farm; crops: Crop[] }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  try {
    const response = await axiosInstance.get<{ farm: Farm; crops: Crop[] }>(`/api/farms/${farmId}`);
    return response.data;
  } catch (error) {
    // If the given farmId is "999", simulate a not found error.
    if (farmId === "999") {
      throw new Error("FARM_NOT_FOUND");
    }

    const farm: Farm = {
      id: farmId,
      name: "Green Valley Farm",
      location: "Bangkok, Thailand",
      type: "durian",
      createdAt: new Date("2023-01-15"),
      area: "12.5 hectares",
      crops: 3,
      // Additional details such as weather can be included if needed.
      weather: {
        temperature: 28,
        humidity: 75,
        rainfall: "25mm last week",
        sunlight: 85,
      },
    };

    const crops: Crop[] = [
      {
        id: "1",
        farmId,
        name: "Monthong Durian",
        plantedDate: new Date("2023-03-15"),
        status: "growing",
        variety: "Premium",
        area: "4.2 hectares",
        healthScore: 92,
        progress: 65,
      },
      {
        id: "2",
        farmId,
        name: "Chanee Durian",
        plantedDate: new Date("2023-02-20"),
        status: "planned",
        variety: "Standard",
        area: "3.8 hectares",
        healthScore: 0,
        progress: 0,
      },
      {
        id: "3",
        farmId,
        name: "Kradum Durian",
        plantedDate: new Date("2022-11-05"),
        status: "harvested",
        variety: "Premium",
        area: "4.5 hectares",
        healthScore: 100,
        progress: 100,
      },
    ];

    return { farm, crops };
  }
}
