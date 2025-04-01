import axiosInstance from "./config";
import type { InventoryItem, CreateInventoryItemInput } from "@/types";

/**
 * Simulates an API call to fetch inventory items.
 * Waits for a simulated delay and then attempts an axios GET request.
 * If the request fails, returns fallback dummy data.
 */
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  try {
    const response = await axiosInstance.get<InventoryItem[]>("/api/inventory");
    return response.data;
  } catch (error) {
    // Fallback dummy data
    return [
      {
        id: 1,
        name: "Tomato Seeds",
        category: "Seeds",
        type: "Plantation",
        quantity: 500,
        unit: "packets",
        lastUpdated: "2023-03-01",
        status: "In Stock",
      },
      {
        id: 2,
        name: "NPK Fertilizer",
        category: "Fertilizer",
        type: "Fertilizer",
        quantity: 200,
        unit: "kg",
        lastUpdated: "2023-03-05",
        status: "Low Stock",
      },
      {
        id: 3,
        name: "Corn Seeds",
        category: "Seeds",
        type: "Plantation",
        quantity: 300,
        unit: "packets",
        lastUpdated: "2023-03-10",
        status: "In Stock",
      },
      {
        id: 4,
        name: "Organic Compost",
        category: "Fertilizer",
        type: "Fertilizer",
        quantity: 150,
        unit: "kg",
        lastUpdated: "2023-03-15",
        status: "Out Of Stock",
      },
      {
        id: 5,
        name: "Wheat Seeds",
        category: "Seeds",
        type: "Plantation",
        quantity: 250,
        unit: "packets",
        lastUpdated: "2023-03-20",
        status: "In Stock",
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
    // Simulate successful creation if API endpoint is not available
    return {
      id: Math.floor(Math.random() * 1000),
      name: item.name,
      category: item.category,
      type: item.type,
      quantity: item.quantity,
      unit: item.unit,
      lastUpdated: new Date().toISOString(),
      status: "In Stock",
    };
  }
}
