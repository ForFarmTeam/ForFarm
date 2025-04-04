import axiosInstance from "./config";
import type { User } from "@/types";

export interface UpdateUserProfileInput {
  username?: string;
  // email?: string;
  // avatar?: string;
}

/**
 * Updates the current user's profile information.
 * Sends a PUT request to the /user/me endpoint.
 * @param data - An object containing the fields to update.
 * @returns The updated user data from the backend.
 */
export async function updateUserProfile(data: UpdateUserProfileInput): Promise<User> {
  try {
    // Backend expects { user: ... } in the response body
    const response = await axiosInstance.put<{ user: User }>("/user/me", data);
    return response.data.user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error(
      (error as any).response?.data?.detail ||
        (error as any).response?.data?.message ||
        "Failed to update profile. Please try again."
    );
  }
}
