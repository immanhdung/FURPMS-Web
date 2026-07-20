/** Tài liệu đính kèm đề xuất (thuyết minh bản gốc, lý lịch khoa học, minh chứng…). */
export interface ProposalDocument {
  id: string;
  fileName: string;
  documentType?: string | null;
  fileSizeBytes: number;
  uploadedAt: string;
  downloadUrl?: string | null;
}

/** QĐ 543 Điều 6.4 — hồ sơ đăng ký gồm thuyết minh + lý lịch khoa học của chủ nhiệm. */
export const DOCUMENT_TYPES = ["Thuyết minh", "Lý lịch khoa học", "Khác"] as const;
