import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";

/** Một file đề cương trong kho chung — khớp `ProposalDocumentDto` của BE. */
export interface GlobalDocument {
  id: string;
  proposalId: string;
  proposalTitle?: string | null;
  principalInvestigatorName?: string | null;
  fileName: string;
  documentType?: string | null;
  fileSizeBytes: number;
  uploadedAt: string;
  downloadUrl?: string | null;
}

export const globalDocumentService = {
  /**
   * GET /api/documents — mọi file đề cương trong hệ thống (Admin/Staff).
   *
   * BE trả MẢNG, không phân trang. Trước 30/09 chỗ này khai `PaginatedResponse` rồi trang đọc
   * `data.items` ⇒ luôn `undefined` ⇒ Kho tài liệu lúc nào cũng trống — một lý do nó bị ẩn khỏi menu.
   */
  list: () =>
    axiosClient.get<ApiResponse<GlobalDocument[]>>("/documents").then((res) => res.data.data),
};
