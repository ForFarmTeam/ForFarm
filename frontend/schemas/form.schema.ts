import * as z from "zod";

export const farmFormSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  type: z.string().min(1, "Please select a farm type"),
});

export const cropFormSchema = z.object({
  name: z.string().min(2, "Crop name must be at least 2 characters"),
  plantedDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  status: z.enum(["growing", "harvested", "planned"]),
});
