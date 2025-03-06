import type { Crop, CropAnalytics, Farm } from "@/types";

/**
 * Fetch mock crop data by id.
 * @param id - The crop identifier.
 * @returns A promise that resolves to a Crop object.
 */
export async function fetchCropById(id: string): Promise<Crop> {
  // Simulate an API delay if needed.
  return Promise.resolve({
    id,
    farmId: "1",
    name: "Monthong Durian",
    plantedDate: new Date("2024-01-15"),
    status: "growing",
    variety: "Premium Grade",
    expectedHarvest: new Date("2024-07-15"),
    area: "2.5 hectares",
    healthScore: 85,
  });
}

/**
 * Fetch mock crop analytics data by crop id.
 * @param id - The crop identifier.
 * @returns A promise that resolves to a CropAnalytics object.
 */
export async function fetchAnalyticsByCropId(id: string): Promise<CropAnalytics> {
  return Promise.resolve({
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
  });
}

/**
 * Simulates an API call to fetch farms.
 * Introduces a delay and a random error to emulate network conditions.
 *
 * @returns A promise that resolves to an array of Farm objects.
 */
export async function fetchFarms(): Promise<Farm[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate a random error (roughly 1 in 10 chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to fetch farms. Please try again later.");
  }

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

/**
 * Simulates an API call to fetch farm details along with its crops.
 * This function adds a delay and randomly generates an error to mimic real-world conditions.
 *
 * @param farmId - The unique identifier of the farm to retrieve.
 * @returns A promise resolving with an object that contains the farm details and an array of crops.
 * @throws An error if the simulated network call fails or if the farm is not found.
 */
export async function fetchFarmDetails(farmId: string): Promise<{ farm: Farm; crops: Crop[] }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Randomly simulate an error (about 1 in 10 chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to fetch farm details. Please try again later.");
  }

  // Simulate a not found error if the given farmId is "999"
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
