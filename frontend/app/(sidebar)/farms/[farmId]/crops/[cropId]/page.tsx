"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Sprout,
  LineChart,
  MessageSquare,
  Settings,
  AlertCircle,
  Droplets,
  Sun,
  ThermometerSun,
  Timer,
  ListCollapse,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatbotDialog } from "./chatbot-dialog";
import { AnalyticsDialog } from "./analytics-dialog";
import type { Crop, CropAnalytics } from "@/types";

const getCropById = (id: string): Crop => {
  return {
    id,
    farmId: "1",
    name: "Monthong Durian",
    plantedDate: new Date("2024-01-15"),
    status: "growing",
  };
};

const getAnalyticsByCropId = (id: string): CropAnalytics => {
  return {
    cropId: id,
    growthProgress: 45, // Percentage
    humidity: 75, // Percentage
    temperature: 28, // °C
    sunlight: 85, // Percentage
    waterLevel: 65, // Percentage
    plantHealth: "good", // "good", "warning", "critical"
    nextAction: "Water the plant",
    nextActionDue: new Date("2024-02-15"),
  };
};

export default function CropDetailPage({ params }: { params: Promise<{ farmId: string; cropId: string }> }) {
  const { farmId, cropId } = React.use(params);

  const router = useRouter();
  const [crop] = useState(getCropById(cropId));
  const analytics = getAnalyticsByCropId(cropId);

  // Colors for plant health badge.
  const healthColors = {
    good: "text-green-500",
    warning: "text-yellow-500",
    critical: "text-red-500",
  };

  const actions = [
    {
      title: "Analytics",
      icon: LineChart,
      description: "View detailed growth analytics",
      onClick: () => setIsAnalyticsOpen(true),
    },
    {
      title: "Chat Assistant",
      icon: MessageSquare,
      description: "Get help and advice",
      onClick: () => setIsChatOpen(true),
    },
    {
      title: "Detailed",
      icon: ListCollapse,
      description: "View detailed of crop",
      onClick: () => console.log("Detailed clicked"),
    },
    {
      title: "Settings",
      icon: Settings,
      description: "Configure crop settings",
      onClick: () => console.log("Settings clicked"),
    },
    {
      title: "Report Issue",
      icon: AlertCircle,
      description: "Report a problem",
      onClick: () => console.log("Report clicked"),
    },
  ];

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  return (
    <div className="container max-w-screen-xl p-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farm
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Crop Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sprout className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{crop.name}</h1>
                  <p className="text-sm text-muted-foreground">Planted on {crop.plantedDate.toLocaleDateString()}</p>
                </div>
              </div>
              <Badge variant="outline" className={healthColors[analytics.plantHealth]}>
                {analytics.plantHealth.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Growth Progress</p>
                  <Progress value={analytics.growthProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">{analytics.growthProgress}% Complete</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <p className="text-2xl font-semibold">{analytics.humidity}%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <p className="text-2xl font-semibold">{analytics.temperature}°C</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Sunlight</span>
                    </div>
                    <p className="text-2xl font-semibold">{analytics.sunlight}%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Water Level</span>
                    </div>
                    <p className="text-2xl font-semibold">{analytics.waterLevel}%</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Next Action Required</span>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium">{analytics.nextAction}</p>
                    <p className="text-sm text-muted-foreground">
                      Due by {analytics.nextActionDue.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Actions</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {actions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={action.onClick}>
                    <action.icon className="h-6 w-6" />
                    <span className="font-medium">{action.title}</span>
                    <span className="text-xs text-muted-foreground text-center">{action.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-[400px]">
            <CardContent className="p-0 h-full">
              <div className="h-full w-full bg-muted/20 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Map placeholder
                    <br />
                    Click to view full map
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Analytics</h2>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="growth">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="growth">Growth</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                  <TabsTrigger value="water">Water</TabsTrigger>
                </TabsList>
                <TabsContent value="growth" className="flex items-center justify-center text-muted-foreground">
                  Growth chart placeholder
                </TabsContent>
                <TabsContent value="health" className="flex items-center justify-center text-muted-foreground">
                  Health metrics placeholder
                </TabsContent>
                <TabsContent value="water" className="flex items-center justify-center text-muted-foreground">
                  Water usage placeholder
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChatbotDialog open={isChatOpen} onOpenChange={setIsChatOpen} cropName={crop.name} />

      <AnalyticsDialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen} crop={crop} analytics={analytics} />
    </div>
  );
}
