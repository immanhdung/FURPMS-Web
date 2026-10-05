import { z } from "zod";

export const researchTypeSchema = z.object({
  code: z.string().min(1, "Phải nhập mã.").max(20, "Mã tối đa 20 ký tự."),
  name: z.string().min(1, "Phải nhập tên."),
  maxBudgetCap: z.number().min(0, "Số tiền phải lớn hơn 0."),
  requireOrderingUnit: z.boolean(),
});

export type ResearchTypeFormValues = z.infer<typeof researchTypeSchema>;
