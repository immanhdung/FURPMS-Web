/**
 * Sản phẩm dự kiến PI cam kết trong đề cương (QĐ 543 — Mẫu 1, mục sản phẩm).
 * Lưu vào `project_deliverables`; khi tạo hợp đồng sẽ được gắn vào hợp đồng và
 * trở thành sản phẩm phải nộp/nghiệm thu. Đề tài PARTIAL bắt buộc có ít nhất 1 cái,
 * nếu không sẽ không sinh được lịch giải ngân.
 */
export interface ExpectedProduct {
  id: number;
  proposalId: string;
  categoryId?: number | null;
  productName: string;
  scientificRequirements?: string | null;
  notes?: string | null;
  sequence?: number | null;
}

export interface ExpectedProductPayload {
  categoryId?: number | null;
  productName: string;
  scientificRequirements?: string;
  notes?: string;
  sequence?: number;
}
