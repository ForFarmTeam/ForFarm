"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Sprout,
  Calendar,
  LayoutGrid,
  AlertTriangle,
  Loader2,
  Home,
  ChevronRight,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CropDialog } from "./crop-dialog";
import { CropCard } from "./crop-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Farm, Cropland } from "@/types";
import { getCropsByFarmId, createCrop, CropResponse } from "@/api/crop";
import { getFarm } from "@/api/farm";

// ===================================================================
// Page Component: FarmDetailPage
// - Manages farm details, crop listings, filter tabs, and crop creation.
// - Performs API requests via React Query.
// ===================================================================
export default function FarmDetailPage() {
  // ---------------------------------------------------------------
  // Routing and URL Params
  // ---------------------------------------------------------------
  const params = useParams<{ farmId: string }>();
  const farmId = params.farmId;
  const router = useRouter();
  const queryClient = useQueryClient();

  // ---------------------------------------------------------------
  // Local State for dialog and crop filter management
  // ---------------------------------------------------------------
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // ---------------------------------------------------------------
  // Data fetching: Farm details and Crops using React Query.
  // - See: https://tanstack.com/query
  // ---------------------------------------------------------------
  const {
    data: farm,
    isLoading: isLoadingFarm,
    isError: isErrorFarm,
    error: errorFarm,
  } = useQuery<Farm>({
    queryKey: ["farm", farmId],
    queryFn: () => getFarm(farmId),
    enabled: !!farmId,
    staleTime: 60 * 1000,
  });

  const {
    data: cropData, // Changed name to avoid conflict
    isLoading: isLoadingCrops,
    isError: isErrorCrops,
    error: errorCrops,
  } = useQuery<CropResponse>({
    // Use CropResponse type
    queryKey: ["crops", farmId],
    queryFn: () => getCropsByFarmId(farmId), // Use updated API function name
    enabled: !!farmId,
    staleTime: 60 * 1000,
  });

  // ---------------------------------------------------------------
  // Mutation: Create Crop
  // - After creation, invalidate queries to refresh data.
  // ---------------------------------------------------------------
  const croplands = useMemo(() => cropData?.croplands || [], [cropData]);

  const mutation = useMutation({
    mutationFn: (newCropData: Partial<Cropland>) => createCrop({ ...newCropData, farmId: farmId }), // Pass farmId here
    onSuccess: (newlyCreatedCrop) => {
      console.log("Successfully created crop:", newlyCreatedCrop);
      queryClient.invalidateQueries({ queryKey: ["crops", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm", farmId] }); // Invalidate farm too to update crop count potentially
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Failed to add crop:", error);
      // TODO: Show user-friendly error message (e.g., using toast)
    },
  });

  const handleAddCrop = async (data: Partial<Cropland>) => {
    await mutation.mutateAsync(data);
  };

  // ---------------------------------------------------------------
  // Determine combined loading and error states from individual queries.
  // ---------------------------------------------------------------
  const isLoading = isLoadingFarm || isLoadingCrops;
  const isError = isErrorFarm || isErrorCrops;
  const error = errorFarm || errorCrops;

  // ---------------------------------------------------------------
  // Filter crops based on the active filter tab.
  // ---------------------------------------------------------------
  const filteredCrops = useMemo(() => {
    // Renamed from filteredCrops
    return croplands.filter(
      (crop) => activeFilter === "all" || crop.status.toLowerCase() === activeFilter.toLowerCase() // Use camelCase status
    );
  }, [croplands, activeFilter]);

  // ---------------------------------------------------------------
  // Calculate counts for each crop status to display in tabs.
  // ---------------------------------------------------------------
  const possibleStatuses = ["growing", "planned", "harvested", "fallow"]; // Use lowercase
  const cropCounts = useMemo(() => {
    return croplands.reduce(
      (acc, crop) => {
        const status = crop.status.toLowerCase(); // Use camelCase status
        if (acc[status] !== undefined) {
          acc[status]++;
        } else {
          acc["other"] = (acc["other"] || 0) + 1; // Count unknown statuses
        }
        acc.all++;
        return acc;
      },
      { all: 0, ...Object.fromEntries(possibleStatuses.map((s) => [s, 0])) } as Record<string, number>
    );
  }, [croplands]);

  // ---------------------------------------------------------------
  // Derive the unique statuses from the crops list for the tabs.
  // ---------------------------------------------------------------
  const availableStatuses = useMemo(() => {
    return ["all", ...new Set(croplands.map((crop) => crop.status.toLowerCase()))]; // Use camelCase status
  }, [croplands]);

  // ===================================================================
  // Render: Main page layout segmented into breadcrumbs, farm cards,
  // crop management, and the crop add dialog.
  // ===================================================================
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-7xl p-6 mx-auto">
        <div className="flex flex-col gap-6">
          {/* ------------------------------
              Breadcrumbs Navigation Section
              ------------------------------ */}
          <nav className="flex items-center text-sm text-muted-foreground">
            <Button
              variant="link"
              className="p-0 h-auto font-normal text-muted-foreground"
              onClick={() => router.push("/")}>
              <Home className="h-3.5 w-3.5 mr-1" />
              Home
            </Button>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Button
              variant="link"
              className="p-0 h-auto font-normal text-muted-foreground"
              onClick={() => router.push("/farms")}>
              Farms
            </Button>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-foreground font-medium truncate">{farm?.name || "Farm Details"}</span>
          </nav>

          {/* ------------------------------
              Back Navigation Button
              ------------------------------ */}
          <Button
            variant="outline"
            size="sm"
            className="w-fit gap-2 text-muted-foreground"
            onClick={() => router.push("/farms")}>
            <ArrowLeft className="h-4 w-4" /> Back to Farms
          </Button>

          {/* ------------------------------
              Error and Loading States
              ------------------------------ */}
          {isError && !isLoadingFarm && !farm && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Farm</AlertTitle>
              <AlertDescription>{(error as Error)?.message || "Could not load farm details."}</AlertDescription>
            </Alert>
          )}
          {isErrorCrops && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Crops</AlertTitle>
              <AlertDescription>{(errorCrops as Error)?.message || "Could not load crop data."}</AlertDescription>
            </Alert>
          )}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading farm details...</p>
            </div>
          )}

          {/* ------------------------------
              Farm Details and Statistics
              ------------------------------ */}
          {!isLoadingFarm && !isErrorFarm && farm && (
            <>
              <div className="grid gap-6 md:grid-cols-12">
                {/* Farm Info Card */}
                <Card className="md:col-span-8">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="capitalize bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200">
                        {farm.farmType}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        Created {new Date(farm.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-start gap-4 mt-2">
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <Sprout className="h-6 w-6 text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold">{farm.name}</h1>
                        <div className="flex items-center text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          Lat: {farm.lat?.toFixed(4)}, Lon: {farm.lon?.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                      <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Total Area</p>
                        <p className="text-lg font-semibold">{farm.totalSize}</p>
                      </div>
                      <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Total Crops</p>
                        <p className="text-lg font-semibold">{isLoadingCrops ? "..." : cropCounts.all ?? 0}</p>
                      </div>
                      <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Growing</p>
                        <p className="text-lg font-semibold">{isLoadingCrops ? "..." : cropCounts.growing ?? 0}</p>
                      </div>
                      <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Harvested</p>
                        <p className="text-lg font-semibold">{isLoadingCrops ? "..." : cropCounts.harvested ?? 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weather Overview Card */}
                <Card className="md:col-span-4">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Sun className="h-5 w-5 mr-2 text-yellow-500" /> Weather Overview
                    </CardTitle>
                    <CardDescription>Current conditions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="font-medium">25°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Humidity</span>
                      <span className="font-medium">60%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Wind</span>
                      <span className="font-medium">10 km/h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rainfall (24h)</span>
                      <span className="font-medium">2 mm</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ------------------------------
                  Crops Section: List and Filtering Tabs
                  ------------------------------ */}
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      <LayoutGrid className="h-5 w-5 mr-2 text-green-600 dark:text-green-300" />
                      Crops / Croplands
                    </h2>
                    <p className="text-sm text-muted-foreground">Manage and monitor all croplands in this farm</p>
                  </div>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add New Crop
                  </Button>
                </div>
                {mutation.isError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Failed to Add Crop</AlertTitle>
                    <AlertDescription>
                      {(mutation.error as Error)?.message || "Could not add the crop. Please try again."}
                    </AlertDescription>
                  </Alert>
                )}

                <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mt-6">
                  <TabsList>
                    {availableStatuses.map((status) => (
                      <TabsTrigger key={status} value={status} className="capitalize">
                        {status === "all" ? "All" : status} ({isLoadingCrops ? "..." : cropCounts[status] ?? 0})
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {isLoadingCrops ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
                    </div>
                  ) : isErrorCrops ? (
                    <div className="text-center py-12 text-destructive">Failed to load crops.</div>
                  ) : (
                    availableStatuses.map((status) => (
                      <TabsContent key={status} value={status} className="mt-6">
                        {filteredCrops.length === 0 && activeFilter === status ? (
                          <div className="flex flex-col items-center justify-center py-12 bg-muted/20 dark:bg-muted/30 rounded-lg border border-dashed">
                            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-4">
                              <Sprout className="h-6 w-6 text-green-600 dark:text-green-300" />
                            </div>
                            <h3 className="text-xl font-medium mb-2">
                              No {status === "all" ? "" : status} crops found
                            </h3>
                            <p className="text-muted-foreground text-center max-w-md mb-6">
                              {status === "all"
                                ? "You haven't added any crops to this farm yet."
                                : `No crops with status "${status}" found.`}
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                              <Plus className="h-4 w-4" />
                              Add {status === "all" ? "your first" : "a new"} crop
                            </Button>
                          </div>
                        ) : activeFilter === status && filteredCrops.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                              {filteredCrops.map((crop, index) => (
                                <motion.div
                                  key={crop.uuid}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ duration: 0.2, delay: index * 0.05 }}>
                                  <CropCard
                                    crop={crop}
                                    onClick={() => router.push(`/farms/${farmId}/crops/${crop.uuid}`)}
                                  />
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        ) : null}
                      </TabsContent>
                    ))
                  )}
                </Tabs>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------
          Add Crop Dialog Component
          - Passes the mutation state to display loading indicators.
          ------------------------------ */}
      <CropDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddCrop}
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}
