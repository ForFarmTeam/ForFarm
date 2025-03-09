"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sprout,
  LineChart,
  MessageSquare,
  Settings,
  Droplets,
  Sun,
  ThermometerSun,
  Timer,
  ListCollapse,
  Calendar,
  Leaf,
  CloudRain,
  Wind,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatbotDialog } from "./chatbot-dialog";
import { AnalyticsDialog } from "./analytics-dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Crop, CropAnalytics } from "@/types";
import GoogleMapWithDrawing from "@/components/google-map-with-drawing";
import { fetchCropById, fetchAnalyticsByCropId } from "@/api/farm";

interface CropDetailPageParams {
  farmId: string;
  cropId: string;
}

export default function CropDetailPage({ params }: { params: Promise<CropDetailPageParams> }) {
  const router = useRouter();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [analytics, setAnalytics] = useState<CropAnalytics | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const resolvedParams = await params;
      const cropData = await fetchCropById(resolvedParams.cropId);
      const analyticsData = await fetchAnalyticsByCropId(resolvedParams.cropId);
      setCrop(cropData);
      setAnalytics(analyticsData);
    }
    fetchData();
  }, [params]);

  if (!crop || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>
    );
  }

  const healthColors = {
    good: "text-green-500 bg-green-50 dark:bg-green-900",
    warning: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900",
    critical: "text-red-500 bg-red-50 dark:bg-red-900",
  };

  const quickActions = [
    {
      title: "Analytics",
      icon: LineChart,
      description: "View detailed growth analytics",
      onClick: () => setIsAnalyticsOpen(true),
      color: "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
    },
    {
      title: "Chat Assistant",
      icon: MessageSquare,
      description: "Get help and advice",
      onClick: () => setIsChatOpen(true),
      color: "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300",
    },
    {
      title: "Crop Details",
      icon: ListCollapse,
      description: "View detailed information",
      onClick: () => console.log("Details clicked"),
      color: "bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300",
    },
    {
      title: "Settings",
      icon: Settings,
      description: "Configure crop settings",
      onClick: () => console.log("Settings clicked"),
      color: "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-7xl p-6 mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="gap-2 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 hover:bg-green-100/50 dark:hover:bg-green-800/50"
              onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back to Farm
            </Button>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" /> Timeline
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      <Sprout className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Growth Timeline</h4>
                    <p className="text-sm text-muted-foreground">Planted on {crop.plantedDate.toLocaleDateString()}</p>
                    <div className="flex items-center pt-2">
                      <Separator className="w-full" />
                      <span className="mx-2 text-xs text-muted-foreground">
                        {Math.floor(analytics.growthProgress)}% Complete
                      </span>
                      <Separator className="w-full" />
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{crop.name}</h1>
              <p className="text-muted-foreground">
                {crop.variety} • {crop.area}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${healthColors[analytics.plantHealth]} border`}>
                    Health Score: {crop.healthScore}%
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    Growing
                  </Badge>
                </div>
                {crop.expectedHarvest ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Expected harvest: {crop.expectedHarvest.toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">Expected harvest date not available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column */}
          <div className="md:col-span-8 space-y-6">
            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center gap-3 transition-all group ${action.color} hover:scale-105`}
                  onClick={action.onClick}>
                  <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium mb-1">{action.title}</div>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>

            {/* Environmental Metrics */}
            <Card className="border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle>Environmental Conditions</CardTitle>
                <CardDescription>Real-time monitoring of growing conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        icon: ThermometerSun,
                        label: "Temperature",
                        value: `${analytics.temperature}°C`,
                        color: "text-orange-500 dark:text-orange-300",
                        bg: "bg-orange-50 dark:bg-orange-900",
                      },
                      {
                        icon: Droplets,
                        label: "Humidity",
                        value: `${analytics.humidity}%`,
                        color: "text-blue-500 dark:text-blue-300",
                        bg: "bg-blue-50 dark:bg-blue-900",
                      },
                      {
                        icon: Sun,
                        label: "Sunlight",
                        value: `${analytics.sunlight}%`,
                        color: "text-yellow-500 dark:text-yellow-300",
                        bg: "bg-yellow-50 dark:bg-yellow-900",
                      },
                      {
                        icon: Leaf,
                        label: "Soil Moisture",
                        value: `${analytics.soilMoisture}%`,
                        color: "text-green-500 dark:text-green-300",
                        bg: "bg-green-50 dark:bg-green-900",
                      },
                      {
                        icon: Wind,
                        label: "Wind Speed",
                        value: analytics.windSpeed,
                        color: "text-gray-500 dark:text-gray-300",
                        bg: "bg-gray-50 dark:bg-gray-900",
                      },
                      {
                        icon: CloudRain,
                        label: "Rainfall",
                        value: analytics.rainfall,
                        color: "text-indigo-500 dark:text-indigo-300",
                        bg: "bg-indigo-50 dark:bg-indigo-900",
                      },
                    ].map((metric) => (
                      <Card
                        key={metric.label}
                        className="border-none shadow-none bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${metric.bg}`}>
                              <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                              <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  {/* Growth Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Growth Progress</span>
                      <span className="text-muted-foreground">{analytics.growthProgress}%</span>
                    </div>
                    <Progress value={analytics.growthProgress} className="h-2" />
                  </div>

                  {/* Next Action Card */}
                  <Card className="border-green-100 dark:border-green-700 bg-green-50/50 dark:bg-green-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800">
                          <Timer className="h-4 w-4 text-green-600 dark:text-green-300" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Next Action Required</p>
                          <p className="text-sm text-muted-foreground">{analytics.nextAction}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due by {analytics.nextActionDue.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card className="border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle>Field Map</CardTitle>
                <CardDescription>View and manage crop location</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[400px]">
                <GoogleMapWithDrawing />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-4 space-y-6">
            {/* Nutrient Levels */}
            <Card className="border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle>Nutrient Levels</CardTitle>
                <CardDescription>Current soil composition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Nitrogen (N)",
                      value: analytics.nutrientLevels.nitrogen,
                      color: "bg-blue-500 dark:bg-blue-700",
                    },
                    {
                      name: "Phosphorus (P)",
                      value: analytics.nutrientLevels.phosphorus,
                      color: "bg-yellow-500 dark:bg-yellow-700",
                    },
                    {
                      name: "Potassium (K)",
                      value: analytics.nutrientLevels.potassium,
                      color: "bg-green-500 dark:bg-green-700",
                    },
                  ].map((nutrient) => (
                    <div key={nutrient.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{nutrient.name}</span>
                        <span className="text-muted-foreground">{nutrient.value}%</span>
                      </div>
                      <Progress value={nutrient.value} className={`h-2 ${nutrient.color}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Activity icon={i} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {
                              [
                                "Irrigation completed",
                                "Nutrient levels checked",
                                "Growth measurement taken",
                                "Pest inspection completed",
                                "Soil pH tested",
                              ][i]
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      {i < 4 && <Separator className="my-4 dark:bg-slate-700" />}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        <ChatbotDialog open={isChatOpen} onOpenChange={setIsChatOpen} cropName={crop.name} />
        <AnalyticsDialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen} crop={crop} analytics={analytics} />
      </div>
    </div>
  );
}

/**
 * Helper component to render an activity icon based on the index.
 */
function Activity({ icon }: { icon: number }) {
  const icons = [
    <Droplets key="0" className="h-4 w-4 text-blue-500 dark:text-blue-300" />,
    <Leaf key="1" className="h-4 w-4 text-green-500 dark:text-green-300" />,
    <LineChart key="2" className="h-4 w-4 text-purple-500 dark:text-purple-300" />,
    <Sprout key="3" className="h-4 w-4 text-yellow-500 dark:text-yellow-300" />,
    <ThermometerSun key="4" className="h-4 w-4 text-orange-500 dark:text-orange-300" />,
  ];
  return icons[icon];
}
