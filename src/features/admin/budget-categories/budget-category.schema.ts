import { z } from "zod";

export const budgetCategorySchema = z.object({
  code: z.string().min(1, "Phải nhập mã."),
  name: z.string().min(1, "Phải nhập tên."),
  sequence: z.number().min(0, "Thứ tự phải từ 0 trở lên."),
  isActive: z.boolean(),
});

export type BudgetCategoryFormValues = z.infer<typeof budgetCategorySchema>;
