"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { plantingDetailsFormSchema } from "@/schemas/application.schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type plantingSchema = z.infer<typeof plantingDetailsFormSchema>;

export default function PlantingDetailsForm() {
  const form = useForm<plantingSchema>({
    resolver: zodResolver(plantingDetailsFormSchema),
    defaultValues: {
      daysToEmerge: 0,
      plantSpacing: 0,
      rowSpacing: 0,
      plantingDepth: 0,
      averageHeight: 0,
      startMethod: "",
      lightProfile: "",
      soilConditions: "",
      plantingDetails: "",
      pruningDetails: "",
      isPerennial: false,
      autoCreateTasks: false,
    },
  });
  return (
    <Form {...form}>
      <form className="grid grid-cols-3 gap-5">
        <FormField
          control={form.control}
          name="daysToEmerge"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">Day to Emerge</FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="daysToEmerge"
                      className="w-96"
                      {...field}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plantSpacing"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">Plant Spacing</FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="plantSpacing"
                      className="w-96"
                      {...field}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rowSpacing"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">Row Spacing</FormLabel>
              <FormControl>
                <div className="mt-10 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="rowSpacing"
                      className="w-96"
                      {...field}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plantingDepth"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Planting Depth
              </FormLabel>
              <FormControl>
                <div className="mt-10 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="plantingDepth"
                      className="w-96"
                      {...field}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="averageHeight"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Average Height
              </FormLabel>
              <FormControl>
                <div className="mt-10 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="averageHeight"
                      className="w-96"
                      {...field}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">Start Method</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-96">
                    <SelectValue placeholder="Select a start method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="transplant">Transplant</SelectItem>
                    <SelectItem value="cutting">Cutting</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lightProfile"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">Light Profile</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-96">
                    <SelectValue placeholder="Select light profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xp">Seed</SelectItem>
                    <SelectItem value="xa">Transplant</SelectItem>
                    <SelectItem value="xz">Cutting</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="soilConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Soil Conditions
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-96">
                    <SelectValue placeholder="Select a soil condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xp">Seed</SelectItem>
                    <SelectItem value="xa">Transplant</SelectItem>
                    <SelectItem value="xz">Cutting</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plantingDetails"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Planting Details
              </FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Textarea
                      id="plantingDetails"
                      className="w-96"
                      {...field}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pruningDetails"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Pruning Details
              </FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Textarea id="pruningDetails" className="w-96" {...field} />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPerennial"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                    <p>Plant is Perennial</p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="autoCreateTasks"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                    <p>Automatically create tasks for new plantings</p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="col-span-3 flex justify-center">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
