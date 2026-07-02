import { z } from "zod";

export const budgetCategorySchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  sequence: z.number().min(0, "Sequence must be 0 or greater"),
  isActive: z.boolean(),
});

export type BudgetCategoryFormValues = z.infer<typeof budgetCategorySchema>;
