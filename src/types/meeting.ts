export interface Meeting {
  id: string;
  councilId: string;
  title?: string | null;
  platform?: string | null;
  meetingLink?: string | null;
  scheduledAt: string;
  durationMinutes: number;
  agenda?: string | null;
  status?: string | null;
}

export interface ScheduleMeetingPayload {
  title?: string;
  platform?: string;
  meetingLink?: string;
  scheduledAt: string;
  durationMinutes: number;
  agenda?: string;
}

export const MEETING_PLATFORMS = ["Google Meet", "Microsoft Teams"] as const;
