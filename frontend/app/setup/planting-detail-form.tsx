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

type plantingSchema = z.infer<typeof plantingDetailsFormSchema>;

export default function PlantingDetailsForm() {
  const form = useForm<plantingSchema>({
    resolver: zodResolver(plantingDetailsFormSchema),
    defaultValues: {},
  });
  return (
    <Form {...form}>
      <form className="space-y-8">
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
                      type="text"
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
                      type="text"
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
                      type="text"
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
                      type="text"
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
                      type="text"
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
      </form>
    </Form>
  );
}
