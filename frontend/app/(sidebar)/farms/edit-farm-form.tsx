"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCallback, useEffect } from "react"; // Added useEffect
import { Loader2 } from "lucide-react";
import type { Farm } from "@/types";
import GoogleMapWithDrawing, { type ShapeData } from "@/components/google-map-with-drawing";

// Schema for editing - make fields optional if needed, but usually same as create
const farmFormSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  latitude: z
    .number({ invalid_type_error: "Latitude must be a number" })
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .refine((val) => val !== 0, { message: "Please select a location on the map." }),
  longitude: z
    .number({ invalid_type_error: "Longitude must be a number" })
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .refine((val) => val !== 0, { message: "Please select a location on the map." }),
  type: z.string().min(1, "Please select a farm type"),
  area: z.string().optional(),
});

export interface EditFarmFormProps {
  initialData: Farm; // Require initial data for editing
  onSubmit: (data: Partial<Omit<Farm, "uuid" | "createdAt" | "updatedAt" | "crops" | "ownerId">>) => Promise<void>; // Exclude non-editable fields
  onCancel: () => void;
  isSubmitting: boolean;
}

export function EditFarmForm({ initialData, onSubmit, onCancel, isSubmitting }: EditFarmFormProps) {
  const form = useForm<z.infer<typeof farmFormSchema>>({
    resolver: zodResolver(farmFormSchema),
    // Set default values from initialData
    defaultValues: {
      name: initialData.name || "",
      latitude: initialData.lat || 0,
      longitude: initialData.lon || 0,
      type: initialData.farmType || "",
      area: initialData.totalSize || "",
    },
  });

  // Update form if initialData changes (e.g., opening dialog for different farms)
  useEffect(() => {
    form.reset({
      name: initialData.name || "",
      latitude: initialData.lat || 0,
      longitude: initialData.lon || 0,
      type: initialData.farmType || "",
      area: initialData.totalSize || "",
    });
  }, [initialData, form.reset]);

  const handleSubmit = async (values: z.infer<typeof farmFormSchema>) => {
    try {
      // Shape data for the API update function
      const farmUpdateData: Partial<Omit<Farm, "uuid" | "createdAt" | "updatedAt" | "crops" | "ownerId">> = {
        name: values.name,
        lat: values.latitude,
        lon: values.longitude,
        farmType: values.type,
        totalSize: values.area,
      };
      await onSubmit(farmUpdateData);
      // No need to reset form here, dialog closing handles it or parent component does
    } catch (error) {
      console.error("Error submitting edit form:", error);
      // Error handled by mutation's onError
    }
  };

  // Map handler - same as AddFarmForm
  const handleShapeDrawn = useCallback(
    (data: ShapeData) => {
      if (data.type === "marker") {
        const { lat, lng } = data.position;
        form.setValue("latitude", lat, { shouldValidate: true });
        form.setValue("longitude", lng, { shouldValidate: true });
      } else {
        console.log(`Shape type '${data.type}' ignored for coordinate update.`);
      }
    },
    [form]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Form Section */}
      <div className="lg:flex-[1]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Fields: Name, Lat/Lon, Type, Area - same structure as AddFarmForm */}
            {/* Farm Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter farm name" {...field} />
                  </FormControl>
                  <FormDescription>This is your farm's display name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Coordinate Fields (Latitude & Longitude) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Select on map"
                        {...field}
                        value={field.value ? field.value.toFixed(6) : ""}
                        disabled
                        readOnly
                        className="disabled:opacity-100 disabled:cursor-default"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Select on map"
                        {...field}
                        value={field.value ? field.value.toFixed(6) : ""}
                        disabled
                        readOnly
                        className="disabled:opacity-100 disabled:cursor-default"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Farm Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select farm type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="durian">Durian</SelectItem>
                      <SelectItem value="mango">Mango</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="mixed">Mixed Crops</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Area Field */}
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Area (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10 hectares" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>The total size of your farm (e.g., "15 rai", "10 hectares").</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {/* Map Section */}
      <div className="lg:flex-[2] min-h-[400px] lg:min-h-0 flex flex-col">
        <FormLabel>Farm Location (Update marker if needed)</FormLabel>
        <div className="mt-2 rounded-md overflow-hidden border flex-grow">
          <GoogleMapWithDrawing
            onShapeDrawn={handleShapeDrawn}
            // Pass initial coordinates to center the map
            initialCenter={{ lat: initialData.lat, lng: initialData.lon }}
            initialZoom={15} // Or a suitable zoom level
            // You could potentially pass the existing farm marker as an initial feature:
            initialFeatures={[{ type: "marker", position: { lat: initialData.lat, lng: initialData.lon } }]}
          />
        </div>
        <FormDescription className="mt-2">
          Click the marker tool and place a new marker to update coordinates.
        </FormDescription>
      </div>
    </div>
  );
}
