import { z } from "zod";

export const contractSchema = z.object({
  proposalId: z.string().min(1, "Phải chọn đề tài đã được duyệt."),
  contractNumber: z.string().optional(),
  scopeTitle: z.string().optional(),
  startDate: z.string().min(1, "Phải chọn ngày bắt đầu."),
  endDate: z.string().min(1, "Phải chọn ngày kết thúc."),
  maxExtensionMonths: z.number().min(0, "Phải từ 0 trở lên."),
  sideARepresentative: z.string().optional(),
  econtractUrl: z.string().optional(),
})
  // Ngày kết thúc trước ngày bắt đầu thì BE cũng chặn (400) — bắt ngay ở form để lỗi hiện
  // dưới đúng ô, khỏi phải bấm gửi mới biết.
  .refine((v) => !v.startDate || !v.endDate || v.endDate > v.startDate, {
    path: ["endDate"],
    message: "Ngày kết thúc phải sau ngày bắt đầu.",
  });

export type ContractFormValues = z.infer<typeof contractSchema>;
