import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProposalDocument } from "@/types/proposal-document";

/**
 * File báo cáo tiến độ (BM06 — góp ý thầy 29/07): PI upload PDF, Staff mở xem rồi mới đánh giá
 * Đạt/Không đạt. Dùng chung entity Document polymorphic (EntityType="ProgressReport") + kiểu
 * ProposalDocument với các luồng tài liệu khác.
 */
export const progressReportDocumentService = {
  list: (reportId: string) =>
    axiosClient
      .get<ApiResponse<ProposalDocument[]>>(`/progress-reports/${reportId}/documents`)
      .then((res) => res.data.data),

  /** `kind = "minutes"`: biên bản họp Hội đồng đánh giá tiến độ (QĐ543 Điều 10.1) — chỉ Staff/Admin. */
  upload: (reportId: string, file: File, kind?: "minutes") => {
    const form = new FormData();
    form.append("file", file);
    return axiosClient
      .post<ApiResponse<ProposalDocument>>(`/progress-reports/${reportId}/documents`, form, {
        params: kind ? { kind } : undefined,
      })
      .then((res) => res.data.data);
  },

  /** Tải qua axios để kèm Authorization header (mở/preview file). */
  downloadBlob: (reportId: string, documentId: string) =>
    axiosClient
      .get<Blob>(`/progress-reports/${reportId}/documents/${documentId}/download`, { responseType: "blob" })
      .then((res) => res.data),
};
