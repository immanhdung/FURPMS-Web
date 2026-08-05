import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProposalDocument } from "@/types/proposal-document";

/**
 * File sản phẩm + minh chứng thử nghiệm (QĐ543 Điều 13.1).
 *
 * Trước đây sản phẩm là chỗ **cuối cùng** còn bắt PI tự host file rồi dán URL, trong khi
 * đề cương / báo cáo tiến độ / báo cáo tổng kết / hợp đồng đều đã upload thật.
 */
export const deliverableDocumentService = {
  list: (deliverableId: number) =>
    axiosClient
      .get<ApiResponse<ProposalDocument[]>>(`/deliverables/${deliverableId}/documents`)
      .then((res) => res.data.data),

  /** `trialEvidence=true` ⇒ minh chứng thử nghiệm; false ⇒ bản sản phẩm. */
  upload: (deliverableId: number, file: File, trialEvidence = false) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient
      .post<ApiResponse<ProposalDocument>>(
        `/deliverables/${deliverableId}/documents?trialEvidence=${trialEvidence}`,
        formData,
      )
      .then((res) => res.data.data);
  },

  downloadBlob: (deliverableId: number, documentId: string) =>
    axiosClient
      .get<Blob>(`/deliverables/${deliverableId}/documents/${documentId}/download`, {
        responseType: "blob",
      })
      .then((res) => res.data),
};
