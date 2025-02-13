"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Farm } from "@/types";
import { farmFormSchema } from "@/schemas/form.schema";

interface AddFarmFormProps {
  onSubmit: (data: Partial<Farm>) => Promise<void>;
  onCancel: () => void;
}

export function AddFarmForm({ onSubmit, onCancel }: AddFarmFormProps) {
  const form = useForm<z.infer<typeof farmFormSchema>>({
    resolver: zodResolver(farmFormSchema),
    defaultValues: {
      name: "",
      location: "",
      type: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter farm location" {...field} />
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
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Farm</Button>
        </div>
      </form>
    </Form>
  );
}
