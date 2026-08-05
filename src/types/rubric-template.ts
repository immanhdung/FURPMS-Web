/** 1 tiêu chí trong bộ. */
export interface RubricCriterionItem {
  id: number;
  criterionName: string;
  maxScore: number;
  sequence: number;
  /** Màn quản lý trả cả tiêu chí đã tắt (để bật lại); màn chấm chỉ nhận tiêu chí đang bật. */
  isActive: boolean;
}

/** Phạm vi áp dụng: bộ này dùng cho lĩnh vực nào trong đợt nào. */
export interface RubricTemplateScope {
  id: number;
  cycleId: number;
  trackId: number;
}

/** "Bộ tiêu chí" — nhiều tiêu chí + loại đề tài áp dụng + phạm vi (đợt, lĩnh vực). */
export interface RubricTemplateFull {
  id: number;
  templateType: string; // REVIEW | ACCEPTANCE | PROGRESS_CHECK
  name: string;
  maxTotalScore: number;
  /** Tổng điểm các tiêu chí ĐANG BẬT (BE tính sẵn). */
  totalCriteriaScore: number;
  /** `totalCriteriaScore === maxTotalScore` — chưa khớp thì BE không cho dùng bộ này để chấm. */
  isTotalValid: boolean;
  appliesBasic: boolean;
  appliesApplied: boolean;
  isActive: boolean;
  criteria: RubricCriterionItem[];
  scopes: RubricTemplateScope[];
}

export interface UpdateTemplatePayload {
  name?: string;
  appliesBasic?: boolean;
  appliesApplied?: boolean;
  isActive?: boolean;
}

export interface SaveScopesPayload {
  entries: { cycleId: number; trackId: number }[];
}

export interface CreateTemplatePayload {
  name: string;
  /** REVIEW hoặc ACCEPTANCE — rule #16 chỉ có 2 hội đồng. */
  templateType: string;
  appliesBasic: boolean;
  appliesApplied: boolean;
}

export interface SaveCriterionPayload {
  criterionName: string;
  maxScore: number;
  sequence?: number;
  isActive?: boolean;
}
