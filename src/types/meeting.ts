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

/** Giá trị canonical BE chấp nhận (IN_PERSON | GOOGLE_MEET | TEAMS); nhãn dịch qua i18n. */
export const MEETING_MODES = [
  { value: "GOOGLE_MEET", labelKey: "reviewBoard.modeGoogleMeet" },
  { value: "TEAMS", labelKey: "reviewBoard.modeTeams" },
  { value: "IN_PERSON", labelKey: "reviewBoard.modeOffline" },
] as const;

export const IN_PERSON = "IN_PERSON";

/** Cảnh báo 1 giảng viên trùng lịch giữa hội đồng này và hội đồng khác. */
export interface ScheduleConflict {
  memberUserId: string;
  memberName: string;
  otherCouncilId: string;
  otherCouncilType?: string | null;
  thisMeetingAt: string;
  otherMeetingAt: string;
}
