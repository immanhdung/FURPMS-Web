/** Biên bản họp hội đồng — khớp BIỂU MẪU 04 của QĐ 543 (xem FURPMS_BE/docs/QD543_Compliance.md §2). */
export interface DecisionResponse {
  id: string;
  councilId: string;
  /** Tổng số thành viên hội đồng */
  totalMembers?: number | null;
  /** Số thành viên có mặt (đã nộp phiếu) */
  attendingMembers?: number | null;
  validBallots?: number | null;
  invalidBallots?: number | null;
  /** Điểm trung bình cuối cùng — chỉ để tham khảo, KHÔNG tự quyết kết quả (rule #12) */
  averageScore?: number | null;
  result?: string | null;
  councilComments?: string | null;
  recommendations?: string | null;
  chairUserId?: string | null;
  secretaryUserId?: string | null;
  /** Có giá trị = Chủ tịch đã duyệt & KHÓA biên bản */
  finalizedAt?: string | null;
  /** BM04 II.1 — biên bản dạng hỏi–đáp (cách 1) */
  qaEntries?: QaEntry[];
  /** BM04 II.1 — ý kiến từng thành viên (chuyên môn / kinh phí) */
  memberOpinions?: MemberOpinion[];
}

/** 1 lượt hỏi–đáp trong biên bản (BM04/BM12 mục II.1). */
export interface QaEntry {
  askedBy?: string | null;
  question: string;
  answer?: string | null;
  order: number;
}

/** Ý kiến 1 thành viên hội đồng (BM04/BM12 II.1) — 2 cột chuyên môn / kinh phí. */
export interface MemberOpinion {
  memberName: string;
  academicComment?: string | null;
  budgetComment?: string | null;
  order: number;
}

/** Thư ký soạn/sửa biên bản (bản nháp). `projectId` chỉ cần khi hội đồng chấm nhiều đề tài. */
export interface SaveMinutesPayload {
  projectId?: string;
  result: string;
  councilComments?: string;
  recommendations?: string;
  qaEntries?: QaEntry[];
  memberOpinions?: MemberOpinion[];
}
