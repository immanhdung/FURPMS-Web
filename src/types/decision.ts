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
}

/** Thư ký soạn/sửa biên bản (bản nháp). `projectId` chỉ cần khi hội đồng chấm nhiều đề tài. */
export interface SaveMinutesPayload {
  projectId?: string;
  result: string;
  councilComments?: string;
  recommendations?: string;
}
