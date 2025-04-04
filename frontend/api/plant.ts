import axiosInstance from "./config";
import type { Plant } from "@/types";

export interface PlantResponse {
  plants: Plant[];
}

export function getPlants(): Promise<PlantResponse> {
  return axiosInstance.get<PlantResponse>("/plant").then((res) => res.data);
}
