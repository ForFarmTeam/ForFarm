"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import type { Farm } from "@/types";
import GoogleMapWithDrawing, { type ShapeData } from "@/components/google-map-with-drawing";

// ===================================================================
// Schema Definition: Validates form inputs using Zod
// See: https://zod.dev
// ===================================================================
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

// ===================================================================
// Component Props Declaration
// ===================================================================
export interface AddFarmFormProps {
  onSubmit: (data: Partial<Farm>) => Promise<void>;
  onCancel: () => void;
}

// ===================================================================
// Component: AddFarmForm
// - Manages the creation of new farm records.
// - Uses React Hook Form with Zod for form validation.
// - Includes a map component for coordinate selection.
// ===================================================================
export function AddFarmForm({ onSubmit, onCancel }: AddFarmFormProps) {
  // ---------------------------------------------------------------
  // State and Form Setup
  // ---------------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof farmFormSchema>>({
    resolver: zodResolver(farmFormSchema),
    defaultValues: {
      name: "",
      latitude: 0, // Defaults handled by validation (marker must be selected)
      longitude: 0,
      type: "",
      area: "",
    },
  });

  // ---------------------------------------------------------------
  // Form Submission Handler
  // - Converts form data to the expected Farm shape.
  // ---------------------------------------------------------------
  const handleSubmit = async (values: z.infer<typeof farmFormSchema>) => {
    try {
      setIsSubmitting(true);
      const farmData: Partial<Farm> = {
        name: values.name,
        lat: values.latitude,
        lon: values.longitude,
        farmType: values.type,
        totalSize: values.area,
      };
      await onSubmit(farmData);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------
  // Map-to-Form Coordination: Update coordinates from the map
  // - Uses useCallback to preserve reference and optimize re-renders.
  // ---------------------------------------------------------------
  const handleShapeDrawn = useCallback(
    (data: ShapeData) => {
      // Log incoming shape data for debugging
      console.log("Shape drawn in form:", data);

      // Only update the form if a single marker (i.e. point) is used
      if (data.type === "marker") {
        const { lat, lng } = data.position;
        form.setValue("latitude", lat, { shouldValidate: true });
        form.setValue("longitude", lng, { shouldValidate: true });
        console.log(`Set form lat: ${lat}, lng: ${lng}`);
      } else {
        // Note: Only markers update coordinates. Other shapes could be handled later.
        console.log(`Received shape type '${data.type}', but only 'marker' updates the form coordinates.`);
      }
    },
    [form]
  );

  // ===================================================================
  // Render: Split into two main sections - Form and Map
  // ===================================================================
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* ==============================
          Start of Form Section
          ============================== */}
      <div className="lg:flex-[1]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                  <FormDescription>This is your farm&apos;s display name.</FormDescription>
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
                  <FormDescription>
                    The total size of your farm (e.g., &quot;15 rai&quot;, &quot;10 hectares&quot;).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Farm"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {/* ==============================
          End of Form Section
          ============================== */}

      {/* ==============================
          Start of Map Section
          - Renders an interactive map for coordinate selection.
          ============================== */}
      <div className="lg:flex-[2] min-h-[400px] lg:min-h-0 flex flex-col">
        <FormLabel>Farm Location (Draw marker on map)</FormLabel>
        <div className="mt-2 rounded-md overflow-hidden border flex-grow">
          <GoogleMapWithDrawing onShapeDrawn={handleShapeDrawn} />
        </div>
        <FormDescription className="mt-2">
          Select the marker tool above the map and click a location to set the latitude and longitude for your farm.
          Only markers will update the coordinates.
        </FormDescription>
      </div>
      {/* ==============================
          End of Map Section
          ============================== */}
    </div>
  );
}
