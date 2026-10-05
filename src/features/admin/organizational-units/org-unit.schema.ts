import { z } from "zod";

export const orgUnitSchema = z.object({
  code: z.string().min(1, "Phải nhập mã."),
  name: z.string().min(1, "Phải nhập tên."),
  unitType: z.string().min(1, "Phải chọn loại đơn vị."),
  parentId: z.number().optional(),
  headUserId: z.string().optional(),
  sortOrder: z.number().optional(),
});

export type OrgUnitFormValues = z.infer<typeof orgUnitSchema>;
