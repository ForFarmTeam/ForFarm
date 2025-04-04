import axiosInstance from "./config";
import type {
  InventoryItem,
  InventoryStatus,
  InventoryItemCategory,
  CreateInventoryItemInput,
  EditInventoryItemInput,
} from "@/types";
import { AxiosError } from "axios";

/**
 * Simulates an API call to fetch inventory items.
 * Waits for a simulated delay and then attempts an axios GET request.
 * If the request fails, returns fallback dummy data.
 *
 *
 */
export async function fetchInventoryStatus(): Promise<InventoryStatus[]> {
  try {
    const response = await axiosInstance.get<InventoryStatus[]>(
      "/inventory/status"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory status:", error);
    return [];
  }
}
export async function fetchInventoryCategory(): Promise<
  InventoryItemCategory[]
> {
  try {
    const response = await axiosInstance.get<InventoryItemCategory[]>(
      "/inventory/category"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory status:", error);
    return [];
  }
}

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  try {
    const response = await axiosInstance.get<InventoryItem[]>("/inventory");
    return response.data;
  } catch (error) {
    console.error("Error while fetching inventory items! " + error);
    throw error;
  }
}

export async function createInventoryItem(
  item: Omit<CreateInventoryItemInput, "id" | "lastUpdated" | "status">
): Promise<InventoryItem> {
  try {
    const response = await axiosInstance.post<InventoryItem>(
      "/inventory",
      item
    );
    return response.data;
  } catch (error: unknown) {
    // Cast error to AxiosError to safely access response properties
    if (error instanceof AxiosError && error.response) {
      // Log the detailed error message
      console.error("Error while creating Inventory Item!");
      console.error("Response Status:", error.response.status); // e.g., 422
      console.error("Error Detail:", error.response.data?.detail); // Custom error message from backend
      console.error("Full Error Response:", error.response.data); // Entire error object (including details)

      // Throw a new error with a more specific message
      throw new Error(
        `Failed to create inventory item: ${
          error.response.data?.detail || error.message
        }`
      );
    } else {
      // Handle other errors (e.g., network errors or unknown errors)
      console.error(
        "Error while creating Inventory Item, unknown error:",
        error
      );
      throw new Error(
        "Failed to create inventory item: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    const response = await axiosInstance.delete("/inventory/" + id);
    return response.data;
  } catch (error: unknown) {
    // Cast error to AxiosError to safely access response properties
    if (error instanceof AxiosError && error.response) {
      // Log the detailed error message
      console.error("Error while deleting Inventory Item!");
      console.error("Response Status:", error.response.status); // e.g., 422
      console.error("Error Detail:", error.response.data?.detail); // Custom error message from backend
      console.error("Full Error Response:", error.response.data); // Entire error object (including details)

      // Throw a new error with a more specific message
      throw new Error(
        `Failed to delete inventory item: ${
          error.response.data?.detail || error.message
        }`
      );
    } else {
      // Handle other errors (e.g., network errors or unknown errors)
      console.error(
        "Error while deleting Inventory Item, unknown error:",
        error
      );
      throw new Error(
        "Failed to delete inventory item: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }
}
export async function updateInventoryItem(
  id: string,
  item: EditInventoryItemInput
) {
  // console.log(id);
  try {
    const response = await axiosInstance.put<InventoryItem>(
      `/inventory/${id}`,
      item
    );
    return response.data;
  } catch (error: unknown) {
    // Cast error to AxiosError to safely access response properties
    if (error instanceof AxiosError && error.response) {
      // Log the detailed error message
      console.error("Error while deleting Inventory Item!");
      console.error("Response Status:", error.response.status); // e.g., 422
      console.error("Error Detail:", error.response.data?.detail); // Custom error message from backend
      console.error("Full Error Response:", error.response.data); // Entire error object (including details)

      // Throw a new error with a more specific message
      throw new Error(
        `Failed to delete inventory item: ${
          error.response.data?.detail || error.message
        }`
      );
    } else {
      // Handle other errors (e.g., network errors or unknown errors)
      console.error(
        "Error while deleting Inventory Item, unknown error:",
        error
      );
      throw new Error(
        "Failed to delete inventory item: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }
}
