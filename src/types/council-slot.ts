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

/**
 * Slot + khung giờ buổi họp. BE trả kèm để màn lịch chấm hiện "đã xếp 60/90 phút" —
 * trước đây Staff phải tự cộng nhẩm, gán thêm đề tài cũng không ai nhắc còn đủ giờ hay không.
 */
export interface CouncilSlotBoard {
  meetingId?: string | null;
  meetingStartAt?: string | null;
  meetingDurationMinutes?: number | null;
  assignedMinutes: number;
  slots: CouncilSlot[];
}
