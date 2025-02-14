import axios from "axios";
import axiosInstance from "./config";
import { User } from "@/types";

export interface UserDataOutput {
  user: User;
}

/**
 * Fetches the data for the authenticated user.
 */
export async function fetchUserMe(): Promise<UserDataOutput> {
  try {
    const response = await axiosInstance.get("/user/me");
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch user data.");
    }
    throw error;
  }
}
