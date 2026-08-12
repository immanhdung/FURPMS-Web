/**
 * Tóm tắt AI — khớp `AiSummaryDto` của BE.
 * Trước đây type này khai `summary` + `highlights[]`, cả hai BE **không hề trả**:
 * card render `data.highlights.map(...)` ⇒ bấm "Tạo tóm tắt" là crash.
 */
export interface SummaryResult {
  id: string;
  proposalId: string;
  summaryText: string;
  /** Người dùng sửa lại bản AI viết (PATCH /proposals/{id}/summary). */
  isEditedByHuman: boolean;
  editedText?: string | null;
  generatedAt: string;
  /** `file+form` = AI đã đọc file đề cương gốc; `textFields` = chỉ có form. */
  source?: string | null;
  sourceFileName?: string | null;
  // Prompt v2 (thầy 05/08): tóm tắt phải gồm tên đề tài, tóm tắt, ưu điểm, nhược điểm.
  title?: string | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
}

export interface SemanticSearchResult {
  id: string;
  title: string;
  snippet: string;
  relevance: number;
  type: "proposal" | "topic";
}

export interface ReviewerSuggestion {
  userId: string;
  fullName: string;
  matchScore: number;
  reason: string;
}

export interface AiFeedbackItem {
  category: string;
  suggestion: string;
}

/**
 * Một điểm lệch giữa thông tin PI điền vào form và file đề cương họ nộp.
 * Thầy 29/07: *"cho AI coi lại mấy cái PI điền vô và so với proposal của họ xem có sai sót gì"*.
 */
export interface AiConsistencyIssue {
  field: string;
  /** MISSING = form thiếu · MISMATCH = hai bên khác nhau · EXTRA = form có mà file không nhắc. */
  kind: "MISSING" | "MISMATCH" | "EXTRA" | string;
  detail: string;
}

export interface AiConsistencyResult {
  fileName?: string | null;
  /** false = đề cương chưa đính kèm file nào ⇒ không đối chiếu được (không phải lỗi). */
  hasFile: boolean;
  issues: AiConsistencyIssue[];
}

/**
 * AI gợi ý điểm cho MỘT tiêu chí (thầy 29/07 nhắc trực tiếp).
 * Chỉ là gợi ý — người chấm vẫn tự nhập điểm cuối (rule #12).
 */
export interface AiScoreSuggestion {
  criterionId: number;
  criterionName: string;
  maxScore: number;
  suggestedScore: number;
  comment: string;
}

/**
 * Bộ tài liệu AI cho người chấm — tóm tắt + gợi ý điểm trong **một lần bấm**.
 *
 * Hai phần có lỗi riêng chứ không chung một lỗi: một phần hỏng thì phần còn lại vẫn dùng được,
 * và người chấm biết chính xác thiếu cái gì thay vì thấy màn hình trắng.
 */
export interface ReviewKit {
  summary: SummaryResult | null;
  suggestions: AiScoreSuggestion[];
  summaryError: string | null;
  suggestionsError: string | null;
}
