import axiosInstance from "./config";
import type {
  InventoryItem,
  InventoryStatus,
  InventoryItemCategory,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
} from "@/types";

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
  } catch (error) {
    console.error("Error while creating Inventory Item! " + error);
    throw new Error("Failed to create inventory item: " + error);
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    const response = await axiosInstance.delete("/inventory/" + id);
    return response.data;
  } catch (error) {
    console.error("Error while deleting Inventory Item! " + error);
    throw new Error("Failed to deleting inventory item: " + error);
  }
}
export async function updateInventoryItem(
  id: string,
  item: UpdateInventoryItemInput
) {
  try {
    const response = await axiosInstance.put<InventoryItem>(
      "/inventory/" + id,
      item
    );
    return response.data;
  } catch (error) {
    console.error("Error while updating Inventory Item! " + error);
    throw new Error("Failed to updating inventory item: " + error);
  }
}
