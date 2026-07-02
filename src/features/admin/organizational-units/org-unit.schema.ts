import { z } from "zod";

export const orgUnitSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  unitType: z.string().min(1, "Unit type is required"),
  parentId: z.number().optional(),
  headUserId: z.string().optional(),
  sortOrder: z.number().optional(),
});

export type OrgUnitFormValues = z.infer<typeof orgUnitSchema>;
