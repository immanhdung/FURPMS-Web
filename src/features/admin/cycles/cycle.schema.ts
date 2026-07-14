import { z } from "zod";

export const cycleSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    academicYear: z.string().min(1, "Academic year is required"),
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
