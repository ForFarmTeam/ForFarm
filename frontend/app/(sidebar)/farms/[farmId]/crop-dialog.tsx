// crop-dialog.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Sprout,
  AlertTriangle,
  Loader2,
  CalendarDays,
  Thermometer,
  Droplets,
  MapPin,
  Maximize,
} from "lucide-react";
import { cn } from "@/lib/utils";
// Import the updated/new types
import type { Cropland, GeoFeatureData, GeoPosition } from "@/types";
import { PlantResponse } from "@/api/plant";
import { getPlants } from "@/api/plant";
// Import the map component and the ShapeData type (ensure ShapeData in types.ts matches this)
import GoogleMapWithDrawing, { type ShapeData } from "@/components/google-map-with-drawing";

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Omit<Cropland, "uuid" | "farmId">>) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Cropland | null;
  isEditing?: boolean;
}

export function CropDialog({ open, onOpenChange, onSubmit, isSubmitting, initialData, isEditing }: CropDialogProps) {
  // --- State ---
  const [selectedPlantUUID, setSelectedPlantUUID] = useState<string | null>(null);
  const [geoFeature, setGeoFeature] = useState<GeoFeatureData | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);

  // --- Load Google Maps Geometry Library ---
  const geometryLib = useMapsLibrary("geometry");

  // --- Fetch Plants ---
  const {
    data: plantData,
    isLoading: isLoadingPlants,
    isError: isErrorPlants,
    error: errorPlants,
  } = useQuery<PlantResponse>({
    queryKey: ["plants"],
    queryFn: getPlants,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
  const plants = useMemo(() => plantData?.plants || [], [plantData]);

  const selectedPlant = useMemo(() => {
    return plants.find((p) => p.uuid === selectedPlantUUID);
  }, [plants, selectedPlantUUID]);

  // --- Reset State on Dialog Close ---
  useEffect(() => {
    if (!open) {
      setSelectedPlantUUID(null);
      setGeoFeature(null);
      setCalculatedArea(null);
    } else if (initialData) {
      setSelectedPlantUUID(initialData.plantId);
      setGeoFeature(initialData.geoFeature ?? null);
      setCalculatedArea(initialData.landSize ?? null);
    }
  }, [open, initialData]);

  // --- Map Interaction Handler ---
  const handleShapeDrawn = useCallback(
    (data: ShapeData) => {
      console.log("Shape drawn:", data);
      if (!geometryLib) {
        console.warn("Geometry library not loaded yet.");
        return;
      }

      let feature: GeoFeatureData | null = null;
      let area: number | null = null;

      // Helper to ensure path points are valid GeoPositions
      const mapPath = (path?: { lat: number; lng: number }[]): GeoPosition[] =>
        (path || []).map((p) => ({ lat: p.lat, lng: p.lng }));

      // Helper to ensure position is a valid GeoPosition
      const mapPosition = (pos?: { lat: number; lng: number }): GeoPosition | null =>
        pos ? { lat: pos.lat, lng: pos.lng } : null;

      if (data.type === "polygon" && data.path && data.path.length > 0) {
        const geoPath = mapPath(data.path);
        feature = { type: "polygon", path: geoPath };
        // Use original path for calculation if library expects {lat, lng}
        area = geometryLib.spherical.computeArea(data.path);
        console.log("Polygon drawn, Area:", area, "m²");
      } else if (data.type === "polyline" && data.path && data.path.length > 0) {
        const geoPath = mapPath(data.path);
        feature = { type: "polyline", path: geoPath };
        area = null;
        console.log("Polyline drawn, Path:", data.path);
      } else if (data.type === "marker" && data.position) {
        const geoPos = mapPosition(data.position);
        if (geoPos) {
          feature = { type: "marker", position: geoPos };
        }
        area = null;
        console.log("Marker drawn at:", data.position);
      } else {
        console.log(`Ignoring shape type: ${data.type} or empty path/position`);
        feature = null;
        area = null;
      }

      setGeoFeature(feature);
      setCalculatedArea(area);
    },
    [geometryLib] // Depend on geometryLib
  );

  // --- Submit Handler ---
  const handleSubmit = async () => {
    // Check for geoFeature instead of just drawnPath
    if (!selectedPlantUUID || !geoFeature) {
      alert("Please select a plant and define a feature (marker, polygon, or polyline) on the map.");
      return;
    }
    // selectedPlant is derived from state using useMemo
    if (!selectedPlant) {
      alert("Selected plant not found."); // Should not happen if UUID is set
      return;
    }

    const cropData: Partial<Cropland> = {
      // Default name, consider making this editable
      name: `${selectedPlant.name} Field ${Math.floor(100 + Math.random() * 900)}`,
      plantId: selectedPlant.uuid,
      status: "planned", // Default status
      // Use calculatedArea if available (only for polygons), otherwise maybe 0
      // The backend might ignore this if it calculates based on GeoFeature
      landSize: calculatedArea ?? 0,
      growthStage: "Planned", // Default growth stage
      priority: 1, // Default priority
      geoFeature: geoFeature, // Add the structured geoFeature data
      // FarmID will be added in the page component mutationFn
    };

    console.log("Submitting Cropland Data:", cropData);

    try {
      await onSubmit(cropData);
      // State reset handled by useEffect watching 'open'
    } catch (error) {
      console.error("Submission failed in dialog:", error);
      // Optionally show an error message to the user within the dialog
    }
  };

  // --- Render ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[950px] md:max-w-[1100px] lg:max-w-[1200px] xl:max-w-7xl p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Cropland" : "Create New Cropland"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the cropland details and location."
              : "Select a plant and draw the cropland boundary or mark its location on the map."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow grid md:grid-cols-12 gap-0 overflow-hidden">
          {/* Left Side: Plant Selection */}
          <div className="md:col-span-4 lg:col-span-3 p-6 pt-2 border-r dark:border-slate-700 overflow-y-auto">
            <h3 className="text-md font-medium mb-4 sticky top-0 bg-background py-2">1. Select Plant</h3>
            {/* Plant selection UI */}
            {isLoadingPlants && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading plants...</span>
              </div>
            )}
            {isErrorPlants && (
              <div className="text-destructive flex items-center gap-2 bg-destructive/10 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5" />
                <span>Error loading plants: {(errorPlants as Error)?.message}</span>
              </div>
            )}
            {!isLoadingPlants && !isErrorPlants && plants.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">No plants available.</div>
            )}
            {!isLoadingPlants && !isErrorPlants && plants.length > 0 && (
              <div className="space-y-3">
                {plants.map((plant) => (
                  <Card
                    key={plant.uuid}
                    className={cn(
                      "p-3 cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors",
                      selectedPlantUUID === plant.uuid &&
                        "border-2 border-primary dark:border-primary dark:bg-primary/5 bg-primary/5"
                    )}
                    onClick={() => setSelectedPlantUUID(plant.uuid)}>
                    <CardContent className="p-0">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-md bg-gradient-to-br from-green-100 to-lime-100 dark:from-green-900 dark:to-lime-900 flex items-center justify-center">
                          <Sprout className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">
                              {plant.name} <span className="text-xs text-muted-foreground">({plant.variety})</span>
                            </h4>
                            {selectedPlantUUID === plant.uuid && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            <p className="flex items-center">
                              <CalendarDays className="h-3 w-3 mr-1" /> Maturity: ~{plant.daysToMaturity ?? "N/A"} days
                            </p>
                            <p className="flex items-center">
                              <Thermometer className="h-3 w-3 mr-1" /> Temp: {plant.optimalTemp ?? "N/A"}°C
                            </p>
                            <p className="flex items-center">
                              <Droplets className="h-3 w-3 mr-1" /> Water: {plant.waterNeeds ?? "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Map */}
          <div className="md:col-span-8 lg:col-span-9 p-6 pt-2 flex flex-col overflow-hidden">
            <h3 className="text-md font-medium mb-4">2. Define Boundary / Location</h3>
            <div className="flex-grow bg-muted/30 dark:bg-muted/20 rounded-md border dark:border-slate-700 overflow-hidden relative">
              <GoogleMapWithDrawing onShapeDrawn={handleShapeDrawn} />

              {/* Display feedback based on drawn shape */}
              {geoFeature?.type === "polygon" && calculatedArea !== null && (
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded shadow-md text-sm flex items-center gap-1">
                  <Maximize className="h-3 w-3 text-blue-600" />
                  Area: {calculatedArea.toFixed(2)} m²
                </div>
              )}
              {geoFeature?.type === "polyline" && geoFeature.path && (
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded shadow-md text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-orange-600" />
                  Boundary path defined ({geoFeature.path.length} points).
                </div>
              )}
              {geoFeature?.type === "marker" && geoFeature.position && (
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded shadow-md text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-red-600" />
                  Marker set at {geoFeature.position.lat.toFixed(4)}, {geoFeature.position.lng.toFixed(4)}.
                </div>
              )}
              {!geometryLib && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading map tools...
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use the drawing tools (Polygon <Maximize className="inline h-3 w-3" />, Polyline{" "}
              <MapPin className="inline h-3 w-3" />, Marker <MapPin className="inline h-3 w-3 text-red-500" />) above
              the map. Area is calculated for polygons.
            </p>
          </div>
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="p-6 pt-4 border-t dark:border-slate-700 mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          {/* Disable submit if no plant OR no feature is selected */}
          <Button onClick={handleSubmit} disabled={!selectedPlantUUID || !geoFeature || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Cropland"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
