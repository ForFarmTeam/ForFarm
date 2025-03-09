"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropName: string;
}

export function ChatbotDialog({ open, onOpenChange, cropName }: ChatbotDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your farming assistant. How can I help you with your ${cropName} today?`,
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
      { role: "assistant", content: `Here's some information about ${cropName}: [AI response placeholder]` },
    ];
    setMessages(newMessages);
    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTitle>Farming Assistant Chat</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="sm:max-w-[500px] p-0 dark:bg-background">
        <div className="flex flex-col h-[600px]">
          <div className="p-4 border-b dark:border-slate-700">
            <h2 className="text-lg font-semibold">Farming Assistant</h2>
            <p className="text-sm text-muted-foreground">Ask questions about your {cropName}</p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground"
                        : "bg-muted dark:bg-muted dark:text-muted-foreground"
                    }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t dark:border-slate-700">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2">
              <Input placeholder="Type your message..." value={input} onChange={(e) => setInput(e.target.value)} />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
