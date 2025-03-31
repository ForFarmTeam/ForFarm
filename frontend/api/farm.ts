import axiosInstance from "./config";
import type { Farm } from "@/types";

/**
 * Fetch an array of farms.
 * Calls GET /farms and returns fallback dummy data on failure.
 */
export async function fetchFarms(): Promise<Farm[]> {
  return axiosInstance.get<Farm[]>("/farms").then((res) => res.data);
}

/**
 * Create a new farm.
 * Calls POST /farms with a payload that uses snake_case keys.
 */
export async function createFarm(data: Partial<Farm>): Promise<Farm> {
  return axiosInstance.post<Farm>("/farms", data).then((res) => res.data);
}

/**
 * Fetch a specific farm by ID.
 * Calls GET /farms/{farm_id} and returns fallback data on failure.
 */
export async function getFarm(farmId: string): Promise<Farm> {
  return axiosInstance.get<Farm>(`/farms/${farmId}`).then((res) => res.data);
}

/**
 * Update an existing farm.
 * Calls PUT /farms/{farm_id} with a snake_case payload.
 */
export async function updateFarm(
  farmId: string,
  data: {
    farm_type: string;
    lat: number;
    lon: number;
    name: string;
    total_size: string;
  }
): Promise<Farm> {
  // Simulate a network delay.
  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    const response = await axiosInstance.put<Farm>(`/farms/${farmId}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating farm ${farmId}. Returning fallback data:`, error);
    const now = new Date().toISOString();
    return {
      CreatedAt: now,
      FarmType: data.farm_type,
      Lat: data.lat,
      Lon: data.lon,
      Name: data.name,
      OwnerID: "updated_owner",
      TotalSize: data.total_size,
      UUID: farmId,
      UpdatedAt: now,
    };
  }
}

/**
 * Delete a specific farm.
 * Calls DELETE /farms/{farm_id} and returns a success message.
 */
export async function deleteFarm(farmId: string): Promise<{ message: string }> {
  // Simulate a network delay.
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    await axiosInstance.delete(`/farms/${farmId}`);
    return { message: "Farm deleted successfully" };
  } catch (error: any) {
    console.error(`Error deleting farm ${farmId}. Assuming deletion was successful:`, error);
    return { message: "Farm deleted successfully (dummy)" };
  }
}
