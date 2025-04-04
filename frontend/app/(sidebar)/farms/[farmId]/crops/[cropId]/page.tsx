"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  LineChart,
  Settings,
  Droplets,
  Sun,
  ThermometerSun,
  Timer,
  Leaf,
  CloudRain,
  Wind,
  Home,
  ChevronRight,
  AlertTriangle,
  Loader2,
  LeafIcon,
  History,
  Bot,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatbotDialog } from "./chatbot-dialog";
import { AnalyticsDialog } from "./analytics-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Cropland, CropAnalytics, Farm } from "@/types";
import { getFarm } from "@/api/farm";
import { getPlants, PlantResponse } from "@/api/plant";
// Import the updated API functions
import { getCropById, fetchCropAnalytics, deleteCrop, updateCrop } from "@/api/crop";
import GoogleMapWithDrawing from "@/components/google-map-with-drawing";
import { toast } from "sonner";
import { CropDialog } from "../../crop-dialog"; // Assuming CropDialog is in the parent directory
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Define the expected shape of data coming from CropDialog for update
// Excludes fields not sent in the PUT request body (uuid, farmId, createdAt, updatedAt)
type CropUpdateData = Omit<Cropland, "uuid" | "farmId" | "createdAt" | "updatedAt">;

export default function CropDetailPage() {
  const router = useRouter();
  const params = useParams<{ farmId: string; cropId: string }>();
  const { farmId, cropId } = params;
  const queryClient = useQueryClient();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isEditCropOpen, setIsEditCropOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- Fetch Farm Data ---
  const { data: farm, isLoading: isLoadingFarm } = useQuery<Farm>({
    queryKey: ["farm", farmId],
    queryFn: () => getFarm(farmId),
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  });

  // --- Fetch Cropland Data ---
  const {
    data: cropland,
    isLoading: isLoadingCropland,
    isError: isErrorCropland,
    error: errorCropland,
  } = useQuery<Cropland>({
    queryKey: ["crop", cropId],
    queryFn: () => getCropById(cropId),
    enabled: !!cropId,
    staleTime: 60 * 1000, // Refetch more often than farm/plants
  });

  // --- Fetch All Plants Data ---
  const {
    data: plantData,
    isLoading: isLoadingPlants,
    isError: isErrorPlants,
    error: errorPlants,
  } = useQuery<PlantResponse>({
    queryKey: ["plants"],
    queryFn: getPlants,
    staleTime: 1000 * 60 * 60, // Plants data is relatively static
    refetchOnWindowFocus: false,
  });

  // --- Derive specific Plant ---
  const plant = useMemo(() => {
    if (!cropland?.plantId || !plantData?.plants) return null;
    return plantData.plants.find((p) => p.uuid === cropland.plantId);
  }, [cropland, plantData]);

  // --- Fetch Crop Analytics Data ---
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
    error: errorAnalytics,
  } = useQuery<CropAnalytics | null>({
    queryKey: ["cropAnalytics", cropId],
    queryFn: () => fetchCropAnalytics(cropId),
    enabled: !!cropId,
    staleTime: 5 * 60 * 1000,
  });

  // --- Delete Crop Mutation ---
  const deleteMutation = useMutation({
    mutationFn: () => deleteCrop(cropId), // Uses DELETE /crop/{cropId}
    onSuccess: () => {
      toast.success(`Crop "${cropland?.name}" deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: ["crops", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm", farmId] });
      queryClient.removeQueries({ queryKey: ["crop", cropId] });
      queryClient.removeQueries({ queryKey: ["cropAnalytics", cropId] });
      router.push(`/farms/${farmId}`);
    },
    onError: (error) => {
      console.error("Failed to delete crop:", error);
      toast.error(`Failed to delete crop: ${(error as Error).message}`);
    },
    onSettled: () => {
      setIsDeleteDialogOpen(false);
    },
  });

  // --- Update Crop Mutation ---
  // Updated to use the new updateCrop signature: updateCrop(cropId, payload)
  const updateMutation = useMutation({
    // dataFromDialog should contain the fields needed for the PUT request body
    mutationFn: async (dataFromDialog: CropUpdateData) => {
      if (!cropId) {
        throw new Error("Crop ID is missing for update.");
      }
      // Prepare the payload matching the UpdateCroplandInput body structure
      // Ensure all required fields for the PUT endpoint are present
      const updatePayload = {
        name: dataFromDialog.name,
        status: dataFromDialog.status,
        priority: dataFromDialog.priority ?? 0, // Use default or ensure it comes from dialog
        landSize: dataFromDialog.landSize ?? 0, // Use default or ensure it comes from dialog
        growthStage: dataFromDialog.growthStage,
        plantId: dataFromDialog.plantId,
        geoFeature: dataFromDialog.geoFeature,
      };
      // Call the API function with cropId and the prepared payload
      return updateCrop(cropId, updatePayload);
    },
    onSuccess: (updatedCrop) => {
      toast.success(`Crop "${updatedCrop.name}" updated successfully.`);
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["crop", cropId] });
      queryClient.invalidateQueries({ queryKey: ["crops", farmId] }); // Update list on farm page if name changed
      queryClient.invalidateQueries({ queryKey: ["farm", farmId] }); // Update farm details if needed
      queryClient.invalidateQueries({ queryKey: ["cropAnalytics", cropId] });
      setIsEditCropOpen(false); // Close the edit dialog
    },
    onError: (error) => {
      console.error("Failed to update crop:", error);
      toast.error(`Failed to update crop: ${(error as Error).message}`);
    },
  });

  // --- Combined Loading and Error States ---
  const isLoading = isLoadingFarm || isLoadingCropland || isLoadingPlants || isLoadingAnalytics;
  const isError = isErrorCropland || isErrorPlants || isErrorAnalytics;
  const error = errorCropland || errorPlants || errorAnalytics;

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Loading crop details...</span>
      </div>
    );
  }

  // --- Error State ---
  if (isError || !cropland) {
    console.error("Error loading crop details:", error);
    const errorMessage = isErrorCropland
      ? `Crop with ID ${cropId} not found or could not be loaded.`
      : (error as Error)?.message || "An unexpected error occurred.";
    return (
      <div className="min-h-screen container max-w-7xl p-6 mx-auto">
        <Button
          variant="outline"
          size="sm"
          className="w-fit gap-2 text-muted-foreground mb-6"
          onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Crop Details</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- Data available, render page ---
  const healthColors = {
    good: "text-green-500 bg-green-50 dark:bg-green-900 border-green-200",
    warning: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900 border-yellow-200",
    critical: "text-red-500 bg-red-50 dark:bg-red-900 border-red-200",
    unknown: "text-gray-500 bg-gray-50 dark:bg-gray-900 border-gray-200", // Added for safety
  };
  // Use a safe default if analytics or plantHealth is missing
  const healthStatus = (analytics?.plantHealth as keyof typeof healthColors) || "unknown";
  const healthColorClass = healthColors[healthStatus] || healthColors.unknown;

  const quickActions = [
    {
      title: "Analytics",
      icon: LineChart,
      description: "View detailed growth analytics",
      onClick: () => setIsAnalyticsOpen(true),
      color: "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
      disabled: !analytics, // Disable if no analytics data
    },
    {
      title: "Chat Assistant",
      icon: Bot,
      description: "Get help and advice",
      onClick: () => setIsChatOpen(true),
      color: "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300",
    },
    // Settings moved to dropdown
  ];

  const plantedDate = cropland.createdAt ? new Date(cropland.createdAt) : null;
  const daysToMaturity = plant?.daysToMaturity;
  const expectedHarvestDate =
    plantedDate && typeof daysToMaturity === "number"
      ? new Date(plantedDate.getTime() + daysToMaturity * 24 * 60 * 60 * 1000)
      : null;

  const growthProgress = analytics?.growthProgress ?? 0;
  const displayArea = typeof cropland.landSize === "number" ? `${cropland.landSize.toFixed(2)} ha` : "N/A";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-7xl p-6 mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-muted-foreground mb-4 flex-wrap">
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-muted-foreground hover:text-primary"
            onClick={() => router.push("/")}>
            <Home className="h-3.5 w-3.5 mr-1" />
            Home
          </Button>
          <ChevronRight className="h-3.5 w-3.5 mx-1 flex-shrink-0" />
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-muted-foreground hover:text-primary"
            onClick={() => router.push("/farms")}>
            Farms
          </Button>
          <ChevronRight className="h-3.5 w-3.5 mx-1 flex-shrink-0" />
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-muted-foreground hover:text-primary max-w-[150px] truncate"
            title={farm?.name || "Farm"}
            onClick={() => router.push(`/farms/${farmId}`)}>
            {farm?.name || "Farm"}
          </Button>
          <ChevronRight className="h-3.5 w-3.5 mx-1 flex-shrink-0" />
          <span className="text-foreground font-medium truncate" title={cropland.name || "Crop"}>
            {cropland.name || "Crop"}
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="w-fit gap-2 text-muted-foreground"
              onClick={() => router.push(`/farms/${farmId}`)}>
              <ArrowLeft className="h-4 w-4" /> Back to Farm
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Crop Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditCropOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Edit Crop</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-700"
                  onClick={() => setIsDeleteDialogOpen(true)}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>Delete Crop</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{cropland.name}</h1>
              <p className="text-muted-foreground">
                {plant?.variety || "Unknown Variety"} • {displayArea}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${healthColorClass} border capitalize`}>
                    {cropland.status}
                  </Badge>
                </div>
                {expectedHarvestDate ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Expected harvest: {expectedHarvestDate.toLocaleDateString()}
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
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  disabled={action.disabled}
                  className={`h-auto p-4 flex flex-col items-center gap-3 transition-all group ${
                    action.disabled ? "opacity-50 cursor-not-allowed" : `${action.color} hover:scale-105`
                  } border-border/30`}
                  onClick={action.onClick}>
                  <div
                    className={`p-3 rounded-lg ${
                      action.disabled ? "bg-muted" : `${action.color.replace("text-", "bg-")}/20`
                    } group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium mb-1">{action.title}</div>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                    {action.disabled && action.title === "Analytics" && (
                      <p className="text-xs text-amber-600 mt-1">(No data)</p>
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {/* Environmental Metrics */}
            <Card className="border-border/30">
              <CardHeader>
                <CardTitle>Environmental Conditions</CardTitle>
                <CardDescription>Real-time monitoring data (if available)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      // ... (metric definitions remain the same)
                      {
                        icon: ThermometerSun,
                        label: "Temperature",
                        value:
                          analytics?.temperature !== null && analytics?.temperature !== undefined
                            ? `${analytics.temperature.toFixed(1)}°C`
                            : "N/A",
                        color: "text-orange-500 dark:text-orange-300",
                        bg: "bg-orange-50 dark:bg-orange-900",
                      },
                      {
                        icon: Droplets,
                        label: "Humidity",
                        value:
                          analytics?.humidity !== null && analytics?.humidity !== undefined
                            ? `${analytics.humidity.toFixed(0)}%`
                            : "N/A",
                        color: "text-blue-500 dark:text-blue-300",
                        bg: "bg-blue-50 dark:bg-blue-900",
                      },
                      {
                        icon: Sun,
                        label: "Sunlight",
                        value:
                          analytics?.sunlight !== null && analytics?.sunlight !== undefined
                            ? `${analytics.sunlight.toFixed(0)}%`
                            : "N/A",
                        color: "text-yellow-500 dark:text-yellow-300",
                        bg: "bg-yellow-50 dark:bg-yellow-900",
                      },
                      {
                        icon: Leaf,
                        label: "Soil Moisture",
                        value:
                          analytics?.soilMoisture !== null && analytics?.soilMoisture !== undefined
                            ? `${analytics.soilMoisture.toFixed(0)}%`
                            : "N/A",
                        color: "text-green-500 dark:text-green-300",
                        bg: "bg-green-50 dark:bg-green-900",
                      },
                      {
                        icon: Wind,
                        label: "Wind Speed",
                        value:
                          analytics?.windSpeed !== null && analytics?.windSpeed !== undefined
                            ? `${analytics.windSpeed.toFixed(1)} m/s`
                            : "N/A",
                        color: "text-gray-500 dark:text-gray-300",
                        bg: "bg-gray-50 dark:bg-gray-900",
                      },
                      {
                        icon: CloudRain,
                        label: "Rainfall (1h)",
                        value:
                          analytics?.rainfall !== null && analytics?.rainfall !== undefined
                            ? `${analytics.rainfall.toFixed(1)} mm`
                            : "N/A",
                        color: "text-indigo-500 dark:text-indigo-300",
                        bg: "bg-indigo-50 dark:bg-indigo-900",
                      },
                    ].map((metric) => (
                      <Card key={metric.label} className="border-border/30 shadow-none bg-card dark:bg-slate-800">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${metric.bg}/50`}>
                              <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                              <p className="text-xl font-semibold tracking-tight">{metric.value}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {/* Show message if no analytics at all */}
                  {!analytics && !isLoadingAnalytics && (
                    <p className="text-center text-sm text-muted-foreground py-4">Environmental data not available.</p>
                  )}
                  {analytics && (
                    <>
                      <Separator />
                      {/* Growth Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Growth Progress</span>
                          <span className="text-muted-foreground">{growthProgress}%</span>
                        </div>
                        <Progress value={growthProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Based on {daysToMaturity ? `${daysToMaturity} days` : "N/A"} to maturity.
                        </p>
                      </div>
                      {/* Next Action Card */}
                      <Card className="border-blue-100 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800">
                              <Timer className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                              <p className="font-medium mb-1">Next Action Required</p>
                              <p className="text-sm text-muted-foreground">
                                {analytics?.nextAction || "Check crop status"}
                              </p>
                              {analytics?.nextActionDue && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Due by {new Date(analytics.nextActionDue).toLocaleDateString()}
                                </p>
                              )}
                              {!analytics?.nextAction && (
                                <p className="text-xs text-muted-foreground mt-1">No immediate actions required.</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card className="border-border/30">
              <CardHeader>
                <CardTitle>Cropland Location / Boundary</CardTitle>
                <CardDescription>Visual representation on the farm</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[400px] overflow-hidden rounded-b-lg">
                <GoogleMapWithDrawing
                  initialFeatures={cropland.geoFeature ? [cropland.geoFeature] : undefined}
                  initialCenter={farm ? { lat: farm.lat, lng: farm.lon } : undefined}
                  initialZoom={15}
                  displayOnly={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-4 space-y-6">
            {/* Nutrient Levels */}
            <Card className="border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LeafIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Nutrient Levels
                </CardTitle>
                <CardDescription>Soil composition (if available)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Check if analytics and nutrientLevels exist before mapping */}
                  {analytics?.nutrientLevels ? (
                    [
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
                          <span className="text-muted-foreground">{nutrient.value ?? "N/A"}%</span>
                        </div>
                        <Progress
                          value={nutrient.value ?? 0}
                          className={`h-2 ${
                            nutrient.value !== null && nutrient.value !== undefined ? nutrient.color : "bg-muted"
                          }`}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">Nutrient data not available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Recent Activity */}
            <Card className="border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates (placeholder)</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {/* Placeholder - Replace with actual activity log */}
                  <div className="text-center py-10 text-muted-foreground">No recent activity logged.</div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        <ChatbotDialog open={isChatOpen} onOpenChange={setIsChatOpen} cropName={cropland.name || "this crop"} />

        {/* Conditionally render AnalyticsDialog only if analytics data exists */}
        {analytics && (
          <AnalyticsDialog
            open={isAnalyticsOpen}
            onOpenChange={setIsAnalyticsOpen}
            crop={cropland} // Pass the full cropland object
            analytics={analytics} // Pass the analytics data
          />
        )}

        {/* Edit Crop Dialog */}
        <CropDialog
          open={isEditCropOpen}
          onOpenChange={setIsEditCropOpen}
          initialData={cropland} // Pass current cropland data to pre-fill the form
          onSubmit={async (data) => {
            // 'data' from the dialog should match CropUpdateData structure
            await updateMutation.mutateAsync(data as CropUpdateData);
          }}
          isSubmitting={updateMutation.isPending}
          isEditing={true} // Indicate that this is for editing
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the crop &quot;{cropland.name}&quot; and all
                associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Crop
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
