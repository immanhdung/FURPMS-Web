import { z } from "zod";

export const financialConfigSchema = z.object({
  code: z.string().min(1, "Code is required"),
  value: z.number(),
  description: z.string().optional(),
  effectiveDate: z.string().min(1, "Effective date is required"),
  isActive: z.boolean(),
});

export type FinancialConfigFormValues = z.infer<typeof financialConfigSchema>;
