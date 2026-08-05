/**
 * Confirmed live: a rubric template's nested criteria are a *different* shape from the
 * standalone RubricCriterion (used by /rubric-criteria) — no `isActive` field, and the name is
 * `criterionName` not `name`. The template's own `criteria` array is the authoritative, complete
 * list of what must be scored for it — don't cross-reference against the standalone list.
 */
export interface RubricTemplateCriterion {
  id: number;
  criterionName: string;
  maxScore: number;
  sequence: number;
}

export interface RubricTemplate {
  id: number;
  /** Confirmed live as e.g. "REVIEW" / "PROGRESS_CHECK" — matches this app's REVIEW_ROUND_TYPE casing directly. */
  templateType?: string | null;
  name?: string | null;
  maxTotalScore?: number | null;
  isActive?: boolean;
  criteria?: RubricTemplateCriterion[] | null;
}

export interface ScoreDetailPayload {
  criterionId: number;
  givenScore: number;
  comments?: string;
}

export interface SubmitScorePayload {
  templateId: number;
  generalComments?: string;
  otherRecommendations?: string;
  scoreDetails: ScoreDetailPayload[];
}

/**
 * Phiếu chấm BE trả về.
 *
 * ⚠️ Trước đây khai `reviewerId` — BE **không hề có** trường đó (nó trả `evaluatorMemberId` +
 * `evaluatorName`). Hệ quả: biên bản của Thư ký hiện "—: 58.0", không biết điểm của ai.
 * Tên người chấm là thứ BẮT BUỘC trong biên bản (BM04 mục ý kiến từng thành viên).
 */
export interface ScoreResponse {
  id: number;
  councilId: string;
  evaluatorMemberId: string;
  evaluatorName: string;
  templateId: number;
  /** Tổng điểm do BE cộng — dùng cái này, đừng tự cộng lại ở FE cho lệch. */
  totalScore: number;
  maxPossibleScore: number;
  isValidBallot: boolean;
  generalComments?: string | null;
  otherRecommendations?: string | null;
  scoreDetails?: ScoreDetailResponse[] | null;
  submittedAt?: string | null;
}

export interface ScoreDetailResponse {
  id: number;
  criterionId: number;
  criterionName: string;
  maxScore: number;
  givenScore: number;
  comments?: string | null;
}
