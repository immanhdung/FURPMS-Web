/** Dòng thời gian đề tài — khớp `ProjectTimelineResponse` của BE. */

export type StageStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "DONE"
  | "AT_RISK"
  | "OVERDUE"
  /** Giai đoạn này không có hạn (ví dụ giải ngân — mở khoá theo điều kiện, không theo ngày). */
  | "NO_DEADLINE";

/** Hạn lấy từ đâu — hiện ra để trả lời ngay câu "hạn này ở đâu ra". */
export type DeadlineSource =
  | "CYCLE"
  | "EXTENSION"
  | "CONTRACT"
  | "RULE_QD543"
  | "DERIVED"
  | "NOT_SET";

export interface ProjectStage {
  /** Mã cố định — khoá i18n `timeline.stage.*`. */
  code: string;
  order: number;
  deadline?: string | null;
  deadlineSource: DeadlineSource;
  /** Câu tiếng Việt giải thích căn cứ, do BE dựng. */
  deadlineBasis?: string | null;
  actualDate?: string | null;
  status: StageStatus;
  /** BE tính, âm = quá hạn. FE KHÔNG tự tính lại (xem chú thích ở DeadlineBadge). */
  daysLeft?: number | null;
  isExtended: boolean;
  entityType?: string | null;
  entityId?: string | null;
}

export interface ProjectTimeline {
  projectId: string;
  projectCode?: string | null;
  titleVi?: string | null;
  projectStatus?: string | null;
  stages: ProjectStage[];
  overdueCount: number;
}

/** Một hạn sắp tới của người đang đăng nhập — dùng cho thẻ nhắc việc trên bảng điều khiển. */
export interface UpcomingDeadline {
  projectId: string;
  projectTitle?: string | null;
  stage: ProjectStage;
}
