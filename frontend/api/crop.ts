import axiosInstance from "./config";
import type { Cropland } from "@/types";

export interface CropResponse {
  croplands: Cropland[];
}

/**
 * Fetch a specific Crop by FarmID.
 * Calls GET /crop/farm/{farm_id} and returns fallback data on failure.
 */
export async function getCrop(farmId: string): Promise<CropResponse> {
  return axiosInstance.get<CropResponse>(`/crop/farm/${farmId}`).then((res) => res.data);
}

// body
// {
//     "farm_id": "string",
//     "growth_stage": "string",
//     "land_size": 0,
//     "name": "string",
//     "plant_id": "string",
//     "priority": 0,
//     "status": "string",
// }

/**
 * Create a new crop by FarmID.
 * Calls POST /crop and returns fallback data on failure.
 */
export async function createCrop(data: Partial<Cropland>): Promise<Cropland> {
  return axiosInstance.post<Cropland>(`/crop`, data).then((res) => res.data);
}
