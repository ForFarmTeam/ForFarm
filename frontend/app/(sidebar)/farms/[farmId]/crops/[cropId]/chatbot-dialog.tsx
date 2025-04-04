"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Loader2, User } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useParams } from "next/navigation";
import { sendChatMessage } from "@/api/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropName: string;
}

export function ChatbotDialog({ open, onOpenChange, cropName }: ChatbotDialogProps) {
  const params = useParams<{ farmId: string; cropId: string }>();
  const { farmId, cropId } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for API call
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message when dialog opens
  useEffect(() => {
    if (open) {
      setMessages([
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Hello! How can I help you with ${cropName} (Crop ID: ${cropId}) today?`,
          timestamp: new Date(),
        },
      ]);
      // Reset input when opening
      setInput("");
      setIsLoading(false);
    }
  }, [open, cropName, cropId]); // Add dependencies

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]); // Add isLoading to scroll when loading appears/disappears

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    // Add user message immediately and clear input, set loading
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true); // Show loading indicator *now*

    // Prepare history for API call (use messages *before* adding the placeholder)
    const apiHistory = [...messages, userMessage] // Include the just-added user message
      .map((msg) => ({ role: msg.role, text: msg.content }));

    try {
      // Call the API function with context
      const response = await sendChatMessage(
        userMessage.content,
        apiHistory,
        farmId, // Pass farmId
        cropId // Pass cropId
      );

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };
      // Replace loading state with the actual response
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending chat message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Sorry, something went wrong. ${(error as Error).message || "Please try again."}`,
        timestamp: new Date(),
      };
      // Replace loading state with the error message
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTitle>Farming Assistant Chat for {cropName}</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="sm:max-w-[500px] p-0 dark:bg-background">
        <div className="flex flex-col h-[600px]">
          <div className="p-4 border-b dark:border-slate-700">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-600" />
              Farming Assistant
            </h2>
            <p className="text-sm text-muted-foreground">Ask about {cropName}</p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(
                (
                  message // Render existing messages
                ) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 border bg-white dark:bg-gray-700 flex-shrink-0 shadow-sm">
                        <AvatarFallback>
                          <Bot className="h-5 w-5 text-green-600" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] shadow-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground"
                          : "prose prose-sm dark:prose-invert bg-muted dark:bg-muted dark:text-muted-foreground max-w-none"
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
                      <Avatar className="h-8 w-8 border bg-gray-200 dark:bg-gray-600 flex-shrink-0 shadow-sm">
                        <AvatarFallback>
                          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
              )}
              {/* Conditional Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 border bg-white dark:bg-gray-700 flex-shrink-0">
                    <AvatarFallback>
                      <Bot className="h-5 w-5 text-green-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted dark:bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Assistant is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t dark:border-slate-700">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="h-11"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-11 w-11">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
