import { z } from "zod";

export const financialConfigSchema = z.object({
  code: z.string().min(1, "Phải nhập mã."),
  value: z.number(),
  description: z.string().optional(),
  effectiveDate: z.string().min(1, "Phải chọn ngày hiệu lực."),
  isActive: z.boolean(),
});

export type FinancialConfigFormValues = z.infer<typeof financialConfigSchema>;
