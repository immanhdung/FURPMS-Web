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

/** 1 lần gia hạn deadline đợt (rule tuần 10) — ngày gốc giữ nguyên, hiệu lực = bản mới nhất. */
export interface DeadlineExtension {
  id: string;
  oldDeadline: string;
  newDeadline: string;
  reason?: string | null;
  createdByName?: string | null;
  createdAt: string;
}

export interface ExtendDeadlinePayload {
  newDeadline: string;
  reason?: string;
}

export interface CyclePayload {
  name: string;
  academicYear: string;
  researchTypeId: number;
  submissionStartDate: string;
  submissionDeadline: string;
  description?: string;
}
