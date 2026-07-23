import { z } from "zod";

export const contractSchema = z.object({
  proposalId: z.string().min(1, "Select an approved proposal"),
  contractNumber: z.string().optional(),
  scopeTitle: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  maxExtensionMonths: z.number().min(0, "Must be 0 or greater"),
  sideARepresentative: z.string().optional(),
  econtractUrl: z.string().optional(),
});

export type ContractFormValues = z.infer<typeof contractSchema>;
