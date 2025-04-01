import axiosInstance from "./config";
import type { HarvestUnits } from "@/types";

export async function fetchHarvestUnits(): Promise<HarvestUnits[]> {
  try {
    const response = await axiosInstance.get<HarvestUnits[]>("/harvest/units");
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory status:", error);
    return [];
  }
}
