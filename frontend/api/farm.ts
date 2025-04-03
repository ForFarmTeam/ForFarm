import axiosInstance from "./config";
// Use the refactored Farm type
import type { Farm } from "@/types";

/**
 * Fetch an array of farms. Returns Farm[].
 */
export async function fetchFarms(): Promise<Farm[]> {
  // Backend already returns camelCase due to updated JSON tags
  return axiosInstance.get<Farm[]>("/farms").then((res) => res.data); // Assuming backend wraps in { "farms": [...] }
  // If backend returns array directly: return axiosInstance.get<Farm[]>("/farms").then((res) => res.data);
}

/**
 * Create a new farm. Sends camelCase data. Returns Farm.
 */
export async function createFarm(
  data: Partial<Omit<Farm, "uuid" | "createdAt" | "updatedAt" | "crops" | "ownerId">>
): Promise<Farm> {
  // Construct payload matching backend expected camelCase tags
  const payload = {
    name: data.name,
    lat: data.lat,
    lon: data.lon,
    farmType: data.farmType,
    totalSize: data.totalSize,
    // ownerId is added by backend based on token
  };
  return axiosInstance.post<Farm>("/farms", payload).then((res) => res.data);
}

/**
 * Fetch a specific farm by ID. Returns Farm.
 */
export async function getFarm(farmId: string): Promise<Farm> {
  return axiosInstance.get<Farm>(`/farms/${farmId}`).then((res) => res.data); // Assuming backend wraps in { "farm": ... }
  // If backend returns object directly: return axiosInstance.get<Farm>(`/farms/${farmId}`).then((res) => res.data);
}

/**
 * Update an existing farm. Sends camelCase data. Returns Farm.
 */
export async function updateFarm(
  farmId: string,
  data: Partial<Omit<Farm, "uuid" | "createdAt" | "updatedAt" | "crops" | "ownerId">>
): Promise<Farm> {
  // Construct payload matching backend expected camelCase tags
  const payload = {
    name: data.name,
    lat: data.lat,
    lon: data.lon,
    farmType: data.farmType,
    totalSize: data.totalSize,
  };
  return axiosInstance.put<Farm>(`/farms/${farmId}`, payload).then((res) => res.data);
}

/**
 * Delete a specific farm. Returns { message: string }.
 */
export async function deleteFarm(farmId: string): Promise<{ message: string }> {
  return axiosInstance.delete(`/farms/${farmId}`).then((res) => res.data);
}
