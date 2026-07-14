import { z } from "zod";

export const researchOrderSchema = z.object({
  cycleId: z.number().min(1, "Select a research cycle"),
  orderingUnitId: z.number().min(1, "Select an ordering unit"),
  researchArea: z.string().min(1, "Research area is required"),
  problemDescription: z.string().min(1, "Problem description is required"),
  expectedProducts: z.string().min(1, "Expected products are required"),
});

export type ResearchOrderFormValues = z.infer<typeof researchOrderSchema>;
