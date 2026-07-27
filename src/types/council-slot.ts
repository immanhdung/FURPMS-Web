/** Slot theo đề tài (rule tuần 10): khung giờ con của từng đề tài trong buổi họp hội đồng. */
export interface CouncilSlot {
  projectId: string;
  projectTitle: string;
  meetingId?: string | null;
  slotStartAt?: string | null;
  slotDurationMinutes?: number | null;
  slotOrder?: number | null;
}

export interface SlotEntry {
  projectId: string;
  slotStartAt?: string;
  slotDurationMinutes?: number;
  slotOrder?: number;
}
