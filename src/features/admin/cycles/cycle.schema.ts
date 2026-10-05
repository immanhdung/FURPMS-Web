import { z } from "zod";

export const cycleSchema = z
  .object({
    name: z.string().min(1, "Phải nhập tên."),
    // QĐ543 không có khái niệm "năm học" — văn bản dùng NĂM DƯƠNG LỊCH ("Quý I hằng năm…",
    // biểu mẫu ghi "NĂM 20…"). BE cũng chỉ nhận một số nguyên; gõ "2025-2026" là 400.
    academicYear: z
      .string()
      .regex(/^\d{4}$/, "Nhập một năm dương lịch 4 chữ số, ví dụ 2026"),
    researchTypeId: z.number().min(1, "Phải chọn loại đề tài."),
    submissionStartDate: z.string().min(1, "Phải chọn ngày bắt đầu."),
    submissionDeadline: z.string().min(1, "Phải chọn hạn nộp."),
    description: z.string().optional(),
  })
  .refine((data) => new Date(data.submissionDeadline) > new Date(data.submissionStartDate), {
    message: "Hạn nộp phải SAU ngày mở nhận — đặt ngược thì không ai nộp được.",
    path: ["submissionDeadline"],
  });

export type CycleFormValues = z.infer<typeof cycleSchema>;
