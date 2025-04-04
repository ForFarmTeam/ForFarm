// frontend/api/crop.ts
import axiosInstance from "./config";
import type { Cropland, CropAnalytics } from "@/types";

export interface CropResponse {
  croplands: Cropland[];
}

/**
 * Fetch all Croplands for a specific FarmID.
 */
export async function getCropsByFarmId(farmId: string): Promise<CropResponse> {
  return axiosInstance.get<{ croplands: Cropland[] }>(`/crop/farm/${farmId}`).then((res) => res.data);
}

/**
 * Fetch a specific Cropland by its ID.
 */
export async function getCropById(cropId: string): Promise<Cropland> {
  const response = await axiosInstance.get<{ cropland: Cropland }>(`/crop/${cropId}`);
  return response.data.cropland;
}

/**
 * Create a new crop (Cropland).
 */
export async function createCrop(data: {
  name: string;
  status: string;
  priority?: number;
  landSize?: number;
  growthStage: string;
  plantId: string;
  farmId: string;
  geoFeature?: unknown | null;
}): Promise<Cropland> {
  if (!data.farmId) {
    throw new Error("farmId is required to create a crop.");
  }

  const payload = {
    name: data.name,
    status: data.status,
    priority: data.priority ?? 0,
    landSize: data.landSize ?? 0,
    growthStage: data.growthStage,
    plantId: data.plantId,
    farmId: data.farmId,
    geoFeature: data.geoFeature,
  };

  const response = await axiosInstance.post<{ cropland: Cropland }>(`/crop`, payload);
  return response.data.cropland;
}

/**
 * Update an existing cropland by its ID.
 * Note: farmId cannot be changed via this endpoint
 */
export async function updateCrop(
  cropId: string,
  data: {
    name: string;
    status: string;
    priority: number;
    landSize: number;
    growthStage: string;
    plantId: string;
    geoFeature: unknown | null;
  }
): Promise<Cropland> {
  if (!cropId) {
    throw new Error("cropId is required to update a crop.");
  }

  const payload = {
    name: data.name,
    status: data.status,
    priority: data.priority,
    landSize: data.landSize,
    growthStage: data.growthStage,
    plantId: data.plantId,
    geoFeature: data.geoFeature,
  };

  const response = await axiosInstance.put<{ cropland: Cropland }>(`/crop/${cropId}`, payload);
  return response.data.cropland;
}

/**
 * Delete a specific cropland by its ID.
 */
export async function deleteCrop(cropId: string): Promise<{ message: string } | void> {
  const response = await axiosInstance.delete(`/crop/${cropId}`);
  if (response.status === 204) {
    return;
  }
  return response.data as { message: string };
}

/**
 * Fetch analytics data for a specific crop by its ID.
 */
export async function fetchCropAnalytics(cropId: string): Promise<CropAnalytics | null> {
  try {
    const response = await axiosInstance.get<CropAnalytics>(`/analytics/crop/${cropId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching crop analytics:", error);
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
