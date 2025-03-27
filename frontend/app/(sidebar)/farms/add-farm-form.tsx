"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Farm } from "@/types";
import GoogleMapWithDrawing from "@/components/google-map-with-drawing";

const farmFormSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  latitude: z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  longitude: z.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
  type: z.string().min(1, "Please select a farm type"),
  area: z.string().optional(),
});

export interface AddFarmFormProps {
  onSubmit: (data: Partial<Farm>) => Promise<void>;
  onCancel: () => void;
}

export function AddFarmForm({ onSubmit, onCancel }: AddFarmFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof farmFormSchema>>({
    resolver: zodResolver(farmFormSchema),
    defaultValues: {
      name: "",
      latitude: 0,
      longitude: 0,
      type: "",
      area: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof farmFormSchema>) => {
    try {
      setIsSubmitting(true);
      const farmData: Partial<Farm> = {
        Name: values.name,
        Lat: values.latitude,
        Lon: values.longitude,
        FarmType: values.type,
        TotalSize: values.area,
      };
      await onSubmit(farmData);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAreaSelected = (coordinates: { lat: number; lng: number }[]) => {
    if (coordinates.length > 0) {
      const { lat, lng } = coordinates[0];
      form.setValue("latitude", lat);
      form.setValue("longitude", lng);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Form Section */}
      <div className="flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input placeholder="Latitude" {...field} disabled />
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
                    <Input placeholder="Longitude" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Area (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10 hectares" {...field} />
                  </FormControl>
                  <FormDescription>The total size of your farm</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
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

      {/* Map Section */}
      <div className="flex-1">
        <FormLabel>Farm Location</FormLabel>
        <GoogleMapWithDrawing onAreaSelected={handleAreaSelected} />
      </div>
    </div>
  );
}
