import type { CycleStatus } from "@/constants/statuses";

export interface Cycle {
  id: number;
  name: string;
  academicYear: string;
  researchTypeId: number;
  submissionStartDate: string;
  submissionDeadline: string;
  description?: string | null;
  status: CycleStatus;
}

export interface CyclePayload {
  name: string;
  academicYear: string;
  researchTypeId: number;
  submissionStartDate: string;
  submissionDeadline: string;
  description?: string;
}
