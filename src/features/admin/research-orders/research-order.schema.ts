import { z } from "zod";

export const researchOrderSchema = z.object({
  cycleId: z.number().min(1, "Phải chọn đợt nghiên cứu."),
  orderingUnitId: z.number().min(1, "Phải chọn đơn vị đặt hàng."),
  researchArea: z.string().min(1, "Phải nhập lĩnh vực nghiên cứu."),
  problemDescription: z.string().min(1, "Phải mô tả vấn đề cần giải quyết."),
  expectedProducts: z.string().min(1, "Phải nêu sản phẩm dự kiến."),
});

export type ResearchOrderFormValues = z.infer<typeof researchOrderSchema>;
