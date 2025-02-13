"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { harvestDetailsFormSchema } from "@/schemas/application.schema";
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

type harvestSchema = z.infer<typeof harvestDetailsFormSchema>;

export default function HarvestDetailsForm() {
  const form = useForm<harvestSchema>({
    resolver: zodResolver(harvestDetailsFormSchema),
    defaultValues: {},
  });
  return (
    <Form {...form}>
      <form className="grid grid-cols-3 gap-5">
        <FormField
          control={form.control}
          name="daysToFlower"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Days To Flower
              </FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="daysToFlower"
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
          name="daysToMaturity"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Days To Maturity
              </FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="daysToMaturity"
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
          name="harvestWindow"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Harvest Window
              </FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="harvestWindow"
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
          name="estimatedLossRate"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Estimated Loss Rate
              </FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="estimatedLossRate"
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
          name="harvestUnits"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">Harvest Units</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-96">
                    <SelectValue placeholder="Select a harvest unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bales">bales</SelectItem>
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
          name="estimatedRevenue"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Estimated Revenue
              </FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="estimatedRevenue"
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
          name="expectedYieldPer100ft"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Expected Yield Per100ft
              </FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="expectedYieldPer100ft"
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
          name="expectedYieldPerAcre"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">
                Expected Yield Per Acre
              </FormLabel>
              <FormControl>
                <div className="mt-5 space-y-5">
                  <div className="flex space-x-5">
                    <Input
                      type="number"
                      id="expectedYieldPerAcre"
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
