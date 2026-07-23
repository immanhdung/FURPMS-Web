import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProposalDocument } from "@/types/proposal-document";

/** Minh chứng giải ngân (rule tuần 10): file hợp đồng/chứng từ gắn 1 đợt giải ngân. */
export const disbursementEvidenceService = {
  list: (disbursementId: number) =>
    axiosClient
      .get<ApiResponse<ProposalDocument[]>>(`/disbursements/${disbursementId}/evidence`)
      .then((res) => res.data.data),

  upload: (disbursementId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return axiosClient
      .post<ApiResponse<ProposalDocument>>(`/disbursements/${disbursementId}/evidence`, form)
      .then((res) => res.data.data);
  },

  // Tải qua axios (kèm token) rồi mở — endpoint download cần Authorization, <a href> thường không gửi.
  downloadBlob: (disbursementId: number, documentId: string) =>
    axiosClient
      .get<Blob>(`/disbursements/${disbursementId}/evidence/${documentId}/download`, { responseType: "blob" })
      .then((res) => res.data),
};
