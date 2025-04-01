import axiosInstance from "./config";
import type {
  InventoryItem,
  InventoryItemStatus,
  InventoryItemCategory,
} from "@/types";

/**
 * Simulates an API call to fetch inventory items.
 * Waits for a simulated delay and then attempts an axios GET request.
 * If the request fails, returns fallback dummy data.
 *
 *
 */
export async function fetchInventoryStatus(): Promise<InventoryItemStatus[]> {
  try {
    const response = await axiosInstance.get<InventoryItemStatus[]>(
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
    const response = await axiosInstance.get<InventoryItem[]>("/api/inventory");
    return response.data;
  } catch (error) {
    // Fallback dummy data
    return [
      {
        id: "1",
        name: "Tomato Seeds",
        categoryId: "1",
        quantity: 500,
        unitId: "1",
        lastUpdated: "2023-03-01",
        statusId: "1",
      },
      {
        id: "2",
        name: "NPK Fertilizer",
        categoryId: "3",
        quantity: 200,
        unitId: "2",
        lastUpdated: "2023-03-05",
        statusId: "2",
      },
      {
        id: "3",
        name: "Corn Seeds",
        categoryId: "1",
        quantity: 300,
        unitId: "1",
        lastUpdated: "2023-03-10",
        statusId: "3",
      },
      {
        id: "4",
        name: "Organic Compost",
        categoryId: "3",
        quantity: 150,
        unitId: "2",
        lastUpdated: "2023-03-15",
        statusId: "1",
      },
      {
        id: "5",
        name: "Wheat Seeds",
        categoryId: "1",
        quantity: 250,
        unitId: "2",
        lastUpdated: "2023-03-20",
        statusId: "2",
      },
    ];
  }
}

/**
 * Simulates creating a new inventory item.
 * Uses axios POST and if unavailable, returns a simulated response.
 *
 * Note: The function accepts all fields except id, lastUpdated, and status.
 */
export async function createInventoryItem(
  item: Omit<InventoryItem, "id" | "lastUpdated" | "status">
): Promise<InventoryItem> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    const response = await axiosInstance.post<InventoryItem>(
      "/api/inventory",
      item
    );
    return response.data;
  } catch (error) {
    console.error("Error while creating Inventory Item!" + error);
    throw new Error("Failed to create inventory item: " + error);
  }
}
