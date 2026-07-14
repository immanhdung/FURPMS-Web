import { z } from "zod";

export const rubricCriterionSchema = z.object({
  roundType: z.string().min(1, "Select a round type"),
  orderIndex: z.number().min(0, "Order must be 0 or greater"),
  name: z.string().min(1, "Name is required"),
  maxScore: z.number().min(0, "Must be a positive score"),
  isActive: z.boolean(),
});

export type RubricCriterionFormValues = z.infer<typeof rubricCriterionSchema>;
