"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { getPlants, PlantResponse } from "@/api/plant";
import { Loader2 } from "lucide-react";
import { Cropland } from "@/types";

// Update schema to reflect Cropland fields needed for creation
// Removed plantedDate as it's derived from createdAt on backend
// Added plantId, landSize, growthStage, priority
const cropFormSchema = z.object({
  name: z.string().min(2, "Crop name must be at least 2 characters"),
  plantId: z.string().uuid("Please select a valid plant"), // Changed from name to ID
  status: z.enum(["planned", "growing", "harvested", "fallow"]), // Added fallow
  landSize: z.preprocess(
    (val) => parseFloat(z.string().parse(val)), // Convert string input to number
    z.number().positive("Land size must be a positive number")
  ),
  growthStage: z.string().min(1, "Growth stage is required"),
  priority: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10), // Convert string input to number
    z.number().int().min(0, "Priority must be non-negative")
  ),
  // GeoFeature will be handled separately by the map component later
});

interface AddCropFormProps {
  onSubmit: (data: Partial<Cropland>) => Promise<void>; // Expect Partial<Cropland>
  onCancel: () => void;
  isSubmitting: boolean; // Receive submitting state
}

export function AddCropForm({ onSubmit, onCancel, isSubmitting }: AddCropFormProps) {
  // Fetch plants for the dropdown
  const {
    data: plantData,
    isLoading: isLoadingPlants,
    isError: isErrorPlants,
  } = useQuery<PlantResponse>({
    queryKey: ["plants"],
    queryFn: getPlants,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const form = useForm<z.infer<typeof cropFormSchema>>({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      name: "",
      plantId: "", // Initialize plantId
      status: "planned",
      landSize: 0,
      growthStage: "Planned",
      priority: 1,
    },
  });

  const handleSubmit = (values: z.infer<typeof cropFormSchema>) => {
    // Submit data shaped like Partial<Cropland>
    onSubmit({
      name: values.name,
      plantId: values.plantId,
      status: values.status,
      landSize: values.landSize,
      growthStage: values.growthStage,
      priority: values.priority,
      // farmId is added in the parent component's mutationFn
      // geoFeature would be passed separately if using map here
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cropland Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., North Field Tomatoes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Plant Selection */}
        <FormField
          control={form.control}
          name="plantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Plant</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoadingPlants || isErrorPlants}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingPlants
                          ? "Loading plants..."
                          : isErrorPlants
                          ? "Error loading plants"
                          : "Select the main plant for this cropland"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {!isLoadingPlants &&
                    !isErrorPlants &&
                    plantData?.plants.map((plant) => (
                      <SelectItem key={plant.uuid} value={plant.uuid}>
                        {plant.name} {plant.variety ? `(${plant.variety})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Selection */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="growing">Growing</SelectItem>
                  <SelectItem value="harvested">Harvested</SelectItem>
                  <SelectItem value="fallow">Fallow</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Land Size */}
        <FormField
          control={form.control}
          name="landSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Land Size (e.g., Hectares)</FormLabel>
              <FormControl>
                {/* Use text input for flexibility, validation handles number conversion */}
                <Input
                  type="text"
                  placeholder="e.g., 1.5"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Growth Stage */}
        <FormField
          control={form.control}
          name="growthStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Growth Stage</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Seedling, Vegetative" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 1"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TODO: Add GeoFeature input using the map component if needed within this dialog */}
        {/* <div className="h-64 border rounded-md overflow-hidden"> <GoogleMapWithDrawing onShapeDrawn={...} /> </div> */}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingPlants}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "Adding Crop..." : "Add Crop"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
