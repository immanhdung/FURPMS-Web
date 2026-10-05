/** Change Request types (PI thay đổi đề tài, Staff duyệt) */

export type ChangeRequestType =
  | 1 // ExtendTime
  | 2 // ContentChange
  | 3 // PersonnelChange
  | 4 // BudgetChange
  | 5; // Suspend

export type ChangeRequestStatus = "Pending" | "Approved" | "Rejected";

export interface ChangeRequest {
  id: string;
  proposalId: string;
  type: ChangeRequestType;
  description: string;
  newValue?: string | null;
  status: ChangeRequestStatus;
  adminNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface CreateChangeRequestPayload {
  type: ChangeRequestType;
  description: string;
  newValue?: string;
}

export interface ReviewChangeRequestPayload {
  approved: boolean;
  adminNote?: string;
}

export const CHANGE_REQUEST_TYPE_LABELS: Record<ChangeRequestType, string> = {
  1: "Extend Time",
  2: "Content Change",
  3: "Personnel Change",
  4: "Budget Change",
  5: "Suspend",
};
