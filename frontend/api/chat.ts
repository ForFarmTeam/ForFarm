import axiosInstance from "./config";

interface HistoryItem {
  role: "user" | "model" | "assistant";
  text: string;
}

interface ChatResponse {
  response: string;
  // Include history if backend returns it, otherwise frontend manages it
}

// Map frontend 'assistant' role to backend 'model' role if needed
const mapRoleForApi = (role: "user" | "assistant"): "user" | "model" => {
  return role === "assistant" ? "model" : role;
};

/**
 * Sends a chat message to the backend.
 * Determines the endpoint based on the presence of farmId and cropId.
 *
 * @param message The user's message.
 * @param history The conversation history.
 * @param farmId Optional farm ID for context.
 * @param cropId Optional crop ID for context.
 * @returns The assistant's response.
 */
export async function sendChatMessage(
  message: string,
  history: HistoryItem[],
  farmId?: string | null,
  cropId?: string | null
): Promise<ChatResponse> {
  const endpoint = farmId || cropId ? "/chat/specific" : "/chat"; // Use /chatbot if no IDs
  const apiHistory = history.map((item) => ({
    role: mapRoleForApi(item.role as "user" | "assistant"),
    text: item.text,
  }));

  const payload: {
    message: string;
    farmId?: string;
    cropId?: string;
    history: { role: "user" | "model"; text: string }[];
  } = {
    message,
    history: apiHistory,
  };

  // Only include IDs if calling the contextual endpoint
  if (farmId || cropId) {
    if (farmId) payload.farmId = farmId;
    if (cropId) payload.cropId = cropId;
  }

  console.log(`Sending chat message to ${endpoint} with payload:`, payload);

  try {
    const response = await axiosInstance.post<ChatResponse>(endpoint, payload);
    console.log("Received chat response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error sending chat message to ${endpoint}:`, error);
    // Provide a user-friendly error message
    const errorMessage =
      (error as any).response?.data?.message ||
      "Sorry, I couldn't connect to the assistant right now. Please try again later.";
    // Throw an error with a useful message or return a specific error structure
    // throw new Error(errorMessage);
    // Or return an error response structure:
    return { response: errorMessage };
  }
}
