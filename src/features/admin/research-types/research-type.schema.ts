import { z } from "zod";

export const researchTypeSchema = z.object({
  code: z.string().min(1, "Code is required").max(20, "Code must be at most 20 characters"),
  name: z.string().min(1, "Name is required"),
  maxBudgetCap: z.number().min(0, "Must be a positive amount"),
  requireOrderingUnit: z.boolean(),
});

export type ResearchTypeFormValues = z.infer<typeof researchTypeSchema>;
