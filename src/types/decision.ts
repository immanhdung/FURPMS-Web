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
  /** Thang điểm của phiếu chấm vòng này — để hiện "35/100" chứ không phải "35". */
  rubricTotal?: number | null;
  /** Ngưỡng điểm đạt (phần trăm thang điểm) Quản trị đang đặt. */
  passThresholdPct?: number | null;
  /**
   * Kết luận có lệch với điểm chấm không — do MÁY CHỦ tính, không tự so lại ở giao diện:
   * màn hình và luật chặn phải dùng chung một phép so, không thì cảnh báo nói một đằng mà
   * bấm Lưu lại bị chặn vì một lẽ khác.
   */
  resultDivergesFromScore?: boolean | null;
  /** Lý do hội đồng kết luận khác điểm chấm. */
  resultJustification?: string | null;
  /** Chủ tịch yêu cầu sửa gì — có giá trị nghĩa là biên bản đang bị trả lại. */
  revisionRequestNote?: string | null;
  revisionRequestedAt?: string | null;
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
  /** Bắt buộc khi kết luận lệch với điểm chấm — thiếu thì máy chủ trả 400 kèm câu giải thích. */
  resultJustification?: string;
}
