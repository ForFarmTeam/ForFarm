import axios from "axios";
import axiosInstance from "./config";

export interface LoginResponse {
  token: string;
  message?: string;
}

export interface RegisterResponse {
  token: string;
  message?: string;
}

/**
 * Registers a new user by sending a POST request to the backend.
 */
export async function registerUser(email: string, password: string): Promise<RegisterResponse> {
  try {
    const response = await axiosInstance.post("/auth/register", {
      email: email,
      password: password,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to register.");
    }
    throw error;
  }
}

/**
 * Logs in a user by sending a POST request to the backend.
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email: email,
      password: password,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to log in.");
    }
    throw error;
  }
}
