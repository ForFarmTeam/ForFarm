"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Send,
  Clock,
  X,
  Leaf,
  MessageSquare,
  History,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Farm, Crop } from "@/types";

// Mock data for farms and crops
const mockFarms: Farm[] = [
  {
    id: "farm1",
    name: "Green Valley Farm",
    location: "California",
    type: "Organic",
    createdAt: new Date("2023-01-15"),
    area: "120 acres",
    crops: 8,
    weather: {
      temperature: 24,
      humidity: 65,
      rainfall: "2mm",
      sunlight: 80,
    },
  },
  {
    id: "farm2",
    name: "Sunrise Fields",
    location: "Iowa",
    type: "Conventional",
    createdAt: new Date("2022-11-05"),
    area: "350 acres",
    crops: 5,
    weather: {
      temperature: 22,
      humidity: 58,
      rainfall: "0mm",
      sunlight: 90,
    },
  },
];

const mockCrops: Crop[] = [
  {
    id: "crop1",
    farmId: "farm1",
    name: "Organic Tomatoes",
    plantedDate: new Date("2023-03-10"),
    status: "Growing",
    variety: "Roma",
    area: "15 acres",
    healthScore: 92,
    progress: 65,
  },
  {
    id: "crop2",
    farmId: "farm1",
    name: "Sweet Corn",
    plantedDate: new Date("2023-04-05"),
    status: "Growing",
    variety: "Golden Bantam",
    area: "25 acres",
    healthScore: 88,
    progress: 45,
  },
  {
    id: "crop3",
    farmId: "farm2",
    name: "Soybeans",
    plantedDate: new Date("2023-05-15"),
    status: "Growing",
    variety: "Pioneer",
    area: "120 acres",
    healthScore: 95,
    progress: 30,
  },
];

// Mock chat history
interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  relatedTo?: {
    type: "farm" | "crop";
    id: string;
    name: string;
  };
}

const mockChatHistory: ChatMessage[] = [
  {
    id: "msg1",
    content: "When should I harvest my tomatoes?",
    sender: "user",
    timestamp: new Date("2023-07-15T10:30:00"),
    relatedTo: {
      type: "crop",
      id: "crop1",
      name: "Organic Tomatoes",
    },
  },
  {
    id: "msg2",
    content:
      "Based on the current growth stage of your Roma tomatoes, they should be ready for harvest in approximately 2-3 weeks. The ideal time to harvest is when they've developed their full red color but are still firm to the touch. Keep monitoring the soil moisture levels as consistent watering during the final ripening stage is crucial for flavor development.",
    sender: "bot",
    timestamp: new Date("2023-07-15T10:30:30"),
  },
  {
    id: "msg3",
    content: "What's the best fertilizer for corn?",
    sender: "user",
    timestamp: new Date("2023-07-16T14:22:00"),
    relatedTo: {
      type: "crop",
      id: "crop2",
      name: "Sweet Corn",
    },
  },
  {
    id: "msg4",
    content:
      "For your Sweet Corn at Green Valley Farm, I recommend a nitrogen-rich fertilizer with an NPK ratio of approximately 16-4-8. Corn is a heavy nitrogen feeder, especially during its growth phase. Apply the fertilizer when the plants are knee-high and again when they begin to tassel. Based on your soil analysis, consider supplementing with sulfur to address the slight deficiency detected in your last soil test.",
    sender: "bot",
    timestamp: new Date("2023-07-16T14:22:45"),
  },
];

// Recommended prompts
const recommendedPrompts = [
  {
    id: "prompt1",
    text: "When should I water my crops?",
    category: "Irrigation",
  },
  {
    id: "prompt2",
    text: "How can I improve soil health?",
    category: "Soil Management",
  },
  {
    id: "prompt3",
    text: "What pests might affect my crops this season?",
    category: "Pest Control",
  },
  {
    id: "prompt4",
    text: "Recommend a crop rotation plan",
    category: "Planning",
  },
  {
    id: "prompt5",
    text: "How to maximize yield for my current crops?",
    category: "Optimization",
  },
  {
    id: "prompt6",
    text: "What's the best time to harvest?",
    category: "Harvesting",
  },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Initialize with a welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        content:
          "👋 Hello! I'm ForFarm Assistant, your farming AI companion. How can I help you today? You can ask me about crop management, pest control, weather impacts, or select a specific farm or crop to get tailored advice.",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter crops based on selected farm
  const filteredCrops = selectedFarm ? mockCrops.filter((crop) => crop.farmId === selectedFarm) : mockCrops;

  // Handle sending a message
  const handleSendMessage = (content: string = inputValue) => {
    if (!content.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
      ...(selectedFarm || selectedCrop
        ? {
            relatedTo: {
              type: selectedCrop ? "crop" : "farm",
              id: selectedCrop || selectedFarm || "",
              name: selectedCrop
                ? mockCrops.find((c) => c.id === selectedCrop)?.name || ""
                : mockFarms.find((f) => f.id === selectedFarm)?.name || "",
            },
          }
        : {}),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        content: generateBotResponse(content, selectedFarm, selectedCrop),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  // Generate a bot response based on the user's message and selected farm/crop
  const generateBotResponse = (message: string, farmId: string | null, cropId: string | null): string => {
    const lowerMessage = message.toLowerCase();

    // Get farm and crop details if selected
    const farm = farmId ? mockFarms.find((f) => f.id === farmId) : null;
    const crop = cropId ? mockCrops.find((c) => c.id === cropId) : null;

    // Personalize response based on selected farm/crop
    let contextPrefix = "";
    if (crop) {
      contextPrefix = `For your ${crop.name} (${crop.variety}) at ${farm?.name || "your farm"}, `;
    } else if (farm) {
      contextPrefix = `For ${farm.name}, `;
    }

    // Generate response based on message content
    if (lowerMessage.includes("water") || lowerMessage.includes("irrigation")) {
      return `${contextPrefix}I recommend watering deeply but infrequently to encourage strong root growth. Based on the current weather conditions${
        farm ? ` in ${farm.location}` : ""
      } (${farm?.weather?.rainfall || "minimal"} rainfall recently), you should water ${
        crop ? `your ${crop.name}` : "your crops"
      } approximately 2-3 times per week, ensuring the soil remains moist but not waterlogged.`;
    } else if (lowerMessage.includes("fertiliz") || lowerMessage.includes("nutrient")) {
      return `${contextPrefix}a balanced NPK fertilizer with a ratio of 10-10-10 would be suitable for general application. ${
        crop
          ? `For ${crop.name} specifically, consider increasing ${
              crop.name.toLowerCase().includes("tomato")
                ? "potassium"
                : crop.name.toLowerCase().includes("corn")
                ? "nitrogen"
                : "phosphorus"
            } for optimal growth during the current ${
              crop.progress && crop.progress < 30 ? "early" : crop.progress && crop.progress < 70 ? "middle" : "late"
            } growth stage.`
          : ""
      }`;
    } else if (lowerMessage.includes("pest") || lowerMessage.includes("insect") || lowerMessage.includes("disease")) {
      return `${contextPrefix}monitor for ${
        crop
          ? crop.name.toLowerCase().includes("tomato")
            ? "tomato hornworms, aphids, and early blight"
            : crop.name.toLowerCase().includes("corn")
            ? "corn borers, rootworms, and rust"
            : "common agricultural pests"
          : "common agricultural pests like aphids, beetles, and fungal diseases"
      }. I recommend implementing integrated pest management (IPM) practices, including regular scouting, beneficial insects, and targeted treatments only when necessary.`;
    } else if (lowerMessage.includes("harvest") || lowerMessage.includes("yield")) {
      return `${contextPrefix}${
        crop
          ? `your ${crop.name} should be ready to harvest in approximately ${Math.max(
              1,
              Math.round((100 - (crop.progress || 50)) / 10)
            )} weeks based on the current growth stage. Look for ${
              crop.name.toLowerCase().includes("tomato")
                ? "firm, fully colored fruits"
                : crop.name.toLowerCase().includes("corn")
                ? "full ears with dried silk and plump kernels"
                : "signs of maturity specific to this crop type"
            }`
          : "harvest timing depends on the specific crops you're growing, but generally you should look for visual cues of ripeness and maturity"
      }.`;
    } else if (lowerMessage.includes("soil") || lowerMessage.includes("compost")) {
      return `${contextPrefix}improving soil health is crucial for sustainable farming. I recommend regular soil testing, adding organic matter through compost or cover crops, practicing crop rotation, and minimizing soil disturbance. ${
        farm
          ? `Based on the soil type common in ${farm.location}, you might also consider adding ${
              farm.location.includes("California") ? "gypsum to improve drainage" : "lime to adjust pH levels"
            }.`
          : ""
      }`;
    } else if (lowerMessage.includes("weather") || lowerMessage.includes("forecast") || lowerMessage.includes("rain")) {
      return `${contextPrefix}${
        farm
          ? `the current conditions show temperature at ${farm.weather?.temperature}°C with ${farm.weather?.humidity}% humidity. There's been ${farm.weather?.rainfall} of rainfall recently, and sunlight levels are at ${farm.weather?.sunlight}% of optimal.`
          : "I recommend checking your local agricultural weather service for the most accurate forecast for your specific location."
      } ${
        crop
          ? `For your ${crop.name}, ${
              farm?.weather?.rainfall === "0mm"
                ? "the dry conditions mean you should increase irrigation"
                : "the recent rainfall means you can reduce irrigation temporarily"
            }.`
          : ""
      }`;
    } else {
      return `${contextPrefix}I understand you're asking about "${message}". To provide the most helpful advice, could you provide more specific details about your farming goals or challenges? I'm here to help with crop management, pest control, irrigation strategies, and more.`;
    }
  };

  // Handle selecting a farm
  const handleFarmSelect = (farmId: string) => {
    setSelectedFarm(farmId);
    setSelectedCrop(null); // Reset crop selection when farm changes
  };

  // Handle selecting a crop
  const handleCropSelect = (cropId: string) => {
    setSelectedCrop(cropId);
  };

  // Handle clicking a recommended prompt
  const handlePromptClick = (promptText: string) => {
    setInputValue(promptText);
    handleSendMessage(promptText);
  };

  // Handle loading a chat history item
  const handleLoadChatHistory = (messageId: string) => {
    // Find the message in history
    const historyItem = mockChatHistory.find((msg) => msg.id === messageId);
    if (!historyItem) return;

    // Set related farm/crop if available
    if (historyItem.relatedTo) {
      if (historyItem.relatedTo.type === "farm") {
        setSelectedFarm(historyItem.relatedTo.id);
        setSelectedCrop(null);
      } else if (historyItem.relatedTo.type === "crop") {
        const crop = mockCrops.find((c) => c.id === historyItem.relatedTo?.id);
        if (crop) {
          setSelectedFarm(crop.farmId);
          setSelectedCrop(historyItem.relatedTo.id);
        }
      }
    }

    // Load the conversation
    const conversation = mockChatHistory.filter(
      (msg) =>
        msg.id === messageId ||
        (msg.timestamp >= historyItem.timestamp && msg.timestamp <= new Date(historyItem.timestamp.getTime() + 60000))
    );

    setMessages(conversation);
    setIsHistoryOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-950 shadow-sm py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/farms")} aria-label="Back to farms">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h1 className="text-xl font-semibold">ForFarm Assistant</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            aria-label={isHistoryOpen ? "Close history" : "Open history"}>
            {isHistoryOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Farm/Crop selector */}
          <div className="bg-white dark:bg-gray-900 p-4 border-b">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                  Select Farm (Optional)
                </label>
                <Select value={selectedFarm || ""} onValueChange={handleFarmSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Farms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Farms</SelectItem>
                    {mockFarms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                  Select Crop (Optional)
                </label>
                <Select value={selectedCrop || ""} onValueChange={handleCropSelect} disabled={!selectedFarm}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedFarm ? "All Crops" : "Select a farm first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFarm && <SelectItem value="all">All Crops</SelectItem>}
                    {filteredCrops.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.sender === "user"
                        ? "bg-green-600 text-white dark:bg-green-700"
                        : "bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm"
                    }`}>
                    {message.relatedTo && (
                      <div className="mb-1">
                        <Badge variant="outline" className="text-xs font-normal">
                          {message.relatedTo.type === "farm" ? "🏡 " : "🌱 "}
                          {message.relatedTo.name}
                        </Badge>
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    <div className="mt-1 text-xs opacity-70 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        ForFarm Assistant is typing...
                      </span>
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
              Recommended Questions
            </h3>
            <div className="flex flex-wrap gap-2">
              {recommendedPrompts.map((prompt) => (
                <Button
                  key={prompt.id}
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-800 dark:text-green-300"
                  onClick={() => handlePromptClick(prompt.text)}>
                  {prompt.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="bg-white dark:bg-gray-900 border-t p-4">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your farm or crops..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat history sidebar */}
        {isHistoryOpen && (
          <div className="w-80 border-l bg-white dark:bg-gray-900 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-medium flex items-center gap-1">
                <History className="h-4 w-4" />
                Chat History
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input placeholder="Search conversations..." className="pl-9" />
              </div>
            </div>

            <Tabs defaultValue="recent" className="flex-1 flex flex-col">
              <TabsList className="mx-3 mb-2">
                <TabsTrigger value="recent" className="flex-1">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="farms" className="flex-1">
                  By Farm
                </TabsTrigger>
                <TabsTrigger value="crops" className="flex-1">
                  By Crop
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="recent" className="m-0 p-0">
                  <div className="space-y-1 p-2">
                    {mockChatHistory
                      .filter((msg) => msg.sender === "user")
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map((message) => (
                        <Card
                          key={message.id}
                          className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          onClick={() => handleLoadChatHistory(message.id)}>
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 bg-green-100 dark:bg-green-900">
                              <div className="text-xs font-medium text-green-700 dark:text-green-300">
                                {message.relatedTo?.name.substring(0, 2) || "Me"}
                              </div>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                  {message.relatedTo ? message.relatedTo.name : "General Question"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {message.timestamp.toLocaleDateString()}
                                </p>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="farms" className="m-0 p-0">
                  <div className="space-y-3 p-3">
                    {mockFarms.map((farm) => (
                      <div key={farm.id}>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{farm.name}</h3>
                        <div className="space-y-1">
                          {mockChatHistory
                            .filter(
                              (msg) =>
                                msg.sender === "user" && msg.relatedTo?.type === "farm" && msg.relatedTo.id === farm.id
                            )
                            .map((message) => (
                              <Card
                                key={message.id}
                                className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                onClick={() => handleLoadChatHistory(message.id)}>
                                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{message.content}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {message.timestamp.toLocaleDateString()}
                                </p>
                              </Card>
                            ))}
                        </div>
                        <Separator className="my-3" />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="crops" className="m-0 p-0">
                  <div className="space-y-3 p-3">
                    {mockCrops.map((crop) => (
                      <div key={crop.id}>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                          <Leaf className="h-3 w-3 text-green-600" />
                          {crop.name}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({mockFarms.find((f) => f.id === crop.farmId)?.name})
                          </span>
                        </h3>
                        <div className="space-y-1">
                          {mockChatHistory
                            .filter(
                              (msg) =>
                                msg.sender === "user" && msg.relatedTo?.type === "crop" && msg.relatedTo.id === crop.id
                            )
                            .map((message) => (
                              <Card
                                key={message.id}
                                className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                onClick={() => handleLoadChatHistory(message.id)}>
                                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{message.content}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {message.timestamp.toLocaleDateString()}
                                </p>
                              </Card>
                            ))}
                        </div>
                        <Separator className="my-3" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
