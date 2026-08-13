import { z } from "zod";

export const rubricCriterionSchema = z.object({
  roundType: z.string().min(1, "Phải chọn loại vòng chấm."),
  orderIndex: z.number().min(0, "Thứ tự phải từ 0 trở lên."),
  name: z.string().min(1, "Phải nhập tên."),
  maxScore: z.number().min(0, "Điểm tối đa phải lớn hơn 0."),
  isActive: z.boolean(),
});

export type RubricCriterionFormValues = z.infer<typeof rubricCriterionSchema>;
