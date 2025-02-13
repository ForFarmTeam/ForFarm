import { z } from "zod";

const plantingDetailsSchema = z.object({
  daysToEmerge: z.number().int().min(0, "Days to emerge must be at least 0"),
  plantSpacing: z.number().min(0, "Plant spacing must be positive"),
  rowSpacing: z.number().min(0, "Row spacing must be positive"),
  plantingDepth: z.number().min(0, "Planting depth must be positive"),
  averageHeight: z.number().min(0, "Average height must be positive"),
  startMethod: z.string().optional(),
  lightProfile: z.string().optional(),
  soilConditions: z.string().optional(),
  plantingDetails: z.string().optional(),
  pruningDetails: z.string().optional(),
  isPerennial: z.boolean(),
  autoCreateTasks: z.boolean(),
});

const harvestDetailsSchema = z.object({
  daysToFlower: z.number().int().min(0, "Days to flower must be at least 0"),
  daysToMaturity: z
    .number()
    .int()
    .min(0, "Days to maturity must be at least 0"),
  harvestWindow: z.number().int().min(0, "Harvest window must be at least 0"),
  estimatedLossRate: z
    .number()
    .min(0, "Loss rate must be positive")
    .max(100, "Loss rate cannot exceed 100"),
  harvestUnits: z.string().min(1, "Harvest units are required"),
  estimatedRevenue: z.number().min(0, "Estimated revenue must be positive"),
  expectedYieldPer100ft: z
    .number()
    .min(0, "Expected yield per 100ft must be positive"),
  expectedYieldPerAcre: z
    .number()
    .min(0, "Expected yield per acre must be positive"),
});

export { plantingDetailsSchema, harvestDetailsSchema };
