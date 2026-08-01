/** 1 tiêu chí trong bộ. */
export interface RubricCriterionItem {
  id: number;
  criterionName: string;
  maxScore: number;
  sequence: number;
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
