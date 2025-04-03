import axiosInstance from "./config";
// Use refactored types
import type { Cropland, CropAnalytics } from "@/types";

export interface CropResponse {
  croplands: Cropland[];
}

/**
 * Fetch all Croplands for a specific FarmID. Returns CropResponse.
 */
export async function getCropsByFarmId(farmId: string): Promise<CropResponse> {
  // Assuming backend returns { "croplands": [...] }
  return axiosInstance.get<CropResponse>(`/crop/farm/${farmId}`).then((res) => res.data);
}

/**
 * Fetch a specific Cropland by its ID. Returns Cropland.
 */
export async function getCropById(cropId: string): Promise<Cropland> {
  // Assuming backend returns { "cropland": ... }
  return axiosInstance.get<Cropland>(`/crop/${cropId}`).then((res) => res.data);
  // If backend returns object directly: return axiosInstance.get<Cropland>(`/crop/${cropId}`).then((res) => res.data);
}

/**
 * Create a new crop (Cropland). Sends camelCase data matching backend tags. Returns Cropland.
 */
export async function createCrop(data: Partial<Omit<Cropland, "uuid" | "createdAt" | "updatedAt">>): Promise<Cropland> {
  if (!data.farmId) {
    throw new Error("farmId is required to create a crop.");
  }
  // Payload uses camelCase keys matching backend JSON tags
  const payload = {
    name: data.name,
    status: data.status,
    priority: data.priority,
    landSize: data.landSize,
    growthStage: data.growthStage,
    plantId: data.plantId,
    farmId: data.farmId,
    geoFeature: data.geoFeature, // Send the GeoFeature object
  };
  return axiosInstance.post<{ cropland: Cropland }>(`/crop`, payload).then((res) => res.data.cropland); // Assuming backend wraps in { "cropland": ... }
  // If backend returns object directly: return axiosInstance.post<Cropland>(`/crop`, payload).then((res) => res.data);
}

/**
 * Fetch analytics data for a specific crop by its ID. Returns CropAnalytics.
 */
export async function fetchCropAnalytics(cropId: string): Promise<CropAnalytics> {
  // Assuming backend returns { body: { ... } } structure from Huma
  return axiosInstance.get<CropAnalytics>(`/analytics/crop/${cropId}`).then((res) => res.data);
}
