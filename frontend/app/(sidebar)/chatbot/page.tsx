"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Sparkles, Loader2, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Assuming Avatar is in ui folder
import { sendChatMessage } from "@/api/chat"; // Import the API function

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Interface for chat messages
interface ChatMessage {
  id: string;
  role: "user" | "assistant"; // Changed sender to role
  content: string;
  timestamp: Date;
}

// Recommended prompts (keep or adjust as needed)
const recommendedPrompts = [
  {
    id: "prompt1",
    text: "What are common signs of nutrient deficiency in plants?",
    category: "Plant Health",
  },
  {
    id: "prompt2",
    text: "How can I improve soil drainage?",
    category: "Soil Management",
  },
  {
    id: "prompt3",
    text: "Explain integrated pest management (IPM).",
    category: "Pest Control",
  },
  {
    id: "prompt4",
    text: "What are the benefits of crop rotation?",
    category: "Planning",
  },
  {
    id: "prompt5",
    text: "Tell me about sustainable farming practices.",
    category: "Sustainability",
  },
  {
    id: "prompt6",
    text: "How does weather affect crop yield?",
    category: "Weather",
  },
];

export default function GeneralChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for API call
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message
  useEffect(() => {
    setMessages([
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "👋 Hello! I'm ForFarm Assistant, your general farming AI companion. Ask me anything about agriculture, crops, soil, weather, or best practices!",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (content: string = inputValue) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Prepare history for the API call
    const apiHistory = messages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({ role: msg.role, text: msg.content }));

    try {
      // Call the API function *without* farmId and cropId
      const response = await sendChatMessage(userMessage.content, apiHistory);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending general chat message:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I encountered an issue. ${(error as Error).message || "Please try again later."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicking a recommended prompt
  const handlePromptClick = (promptText: string) => {
    setInputValue(promptText);
    // Directly send message after setting input
    // The handleSendMessage function will pick up the new inputValue
    // No need to call handleSendMessage here if the button triggers submit or calls it
    // Let's assume the button just sets the input and the user clicks send
    // OR: uncomment the line below if the button should send immediately
    // handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      {/* Header (Optional - can be simplified as it's part of the main layout) */}
      <header className="border-b bg-white dark:bg-gray-950 shadow-sm py-4 px-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
        <h1 className="text-xl font-semibold">General Farming Assistant</h1>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto pb-4">
          {messages.map((message, i) => (
            <div
              key={message.id || i}
              className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 border bg-white dark:bg-gray-700 flex-shrink-0">
                  <AvatarFallback>
                    <Bot className="h-5 w-5 text-green-600" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                  message.role === "user"
                    ? "bg-green-600 text-white dark:bg-green-700"
                    : "prose prose-sm dark:prose-invert bg-white dark:bg-gray-800 border dark:border-gray-700 max-w-none" // Use prose styles
                }`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                <p
                  className={`mt-1 text-xs opacity-70 ${
                    message.role === "user" ? "text-green-100" : "text-gray-500 dark:text-gray-400"
                  } text-right`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8 border bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                  <AvatarFallback>
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 border bg-white dark:bg-gray-700 flex-shrink-0">
                <AvatarFallback>
                  <Bot className="h-5 w-5 text-green-600" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[80%] rounded-lg p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">Assistant is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Recommended prompts */}
      <div className="bg-white dark:bg-gray-900 border-t p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-green-500" />
          Try asking...
        </h3>
        <div className="flex flex-wrap gap-2">
          {recommendedPrompts.slice(0, 5).map(
            (
              prompt // Limit displayed prompts
            ) => (
              <Button
                key={prompt.id}
                variant="outline"
                size="sm"
                className="text-xs rounded-full bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-800 dark:text-green-300"
                onClick={() => handlePromptClick(prompt.text)}>
                {prompt.text}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white dark:bg-gray-900 border-t p-4 sticky bottom-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask the farming assistant..."
            className="flex-1 h-11"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white h-11 px-5">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
