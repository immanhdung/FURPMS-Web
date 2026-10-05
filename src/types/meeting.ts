export interface Meeting {
  id: string;
  councilId: string;
  title?: string | null;
  platform?: string | null;
  meetingLink?: string | null;
  location?: string | null;
  scheduledAt: string;
  durationMinutes: number;
  agenda?: string | null;
  status?: string | null;
}

export interface ScheduleMeetingPayload {
  title?: string;
  platform?: string;
  meetingLink?: string;
  location?: string;
  scheduledAt: string;
  durationMinutes: number;
  agenda?: string;
}

/**
 * Chỉ 2 hình thức (thầy 05/08, cả 2 bản note đều nêu): trực tiếp / trực tuyến.
 * Nền tảng cụ thể (Meet / Teams / Zoom) không còn phân biệt — Staff dán link nào cũng được.
 * BE map mọi giá trị cũ về ONLINE khi đọc nên dữ liệu cũ vẫn hiển thị đúng.
 */
export const MEETING_MODES = [
  { value: "IN_PERSON", labelKey: "reviewBoard.modeOffline" },
  { value: "ONLINE", labelKey: "reviewBoard.modeOnline" },
] as const;

export const IN_PERSON = "IN_PERSON";

/** Điểm danh 1 thành viên trong buổi họp (memberId = CouncilMember.Id). */
export interface AttendanceEntry {
  memberId: string;
  memberName?: string | null;
  memberRole?: string | null;
  attended?: boolean | null;
  absenceReason?: string | null;
}

/** Cảnh báo 1 giảng viên trùng lịch giữa hội đồng này và hội đồng khác. */
export interface ScheduleConflict {
  memberUserId: string;
  memberName: string;
  otherCouncilId: string;
  otherCouncilType?: string | null;
  thisMeetingAt: string;
  otherMeetingAt: string;
}
