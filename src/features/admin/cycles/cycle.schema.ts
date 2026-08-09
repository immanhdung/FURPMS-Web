import { z } from "zod";

export const cycleSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    // QĐ543 không có khái niệm "năm học" — văn bản dùng NĂM DƯƠNG LỊCH ("Quý I hằng năm…",
    // biểu mẫu ghi "NĂM 20…"). BE cũng chỉ nhận một số nguyên; gõ "2025-2026" là 400.
    academicYear: z
      .string()
      .regex(/^\d{4}$/, "Nhập một năm dương lịch 4 chữ số, ví dụ 2026"),
    researchTypeId: z.number().min(1, "Select a research type"),
    submissionStartDate: z.string().min(1, "Start date is required"),
    submissionDeadline: z.string().min(1, "Deadline is required"),
    description: z.string().optional(),
  })
  .refine((data) => new Date(data.submissionDeadline) > new Date(data.submissionStartDate), {
    message: "Deadline must be after the start date",
    path: ["submissionDeadline"],
  });

export type CycleFormValues = z.infer<typeof cycleSchema>;
