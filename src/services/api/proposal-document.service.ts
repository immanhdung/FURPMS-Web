import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProposalDocument } from "@/types/proposal-document";

export const proposalDocumentService = {
  list: (proposalId: string) =>
    axiosClient
      .get<ApiResponse<ProposalDocument[]>>(`/proposals/${proposalId}/documents`)
      .then((res) => res.data.data),

  /** Upload file thật (multipart) — BE chặn theo dung lượng + đuôi file Admin cấu hình. */
  upload: (proposalId: string, file: File, documentType?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (documentType) form.append("documentType", documentType);
    return axiosClient
      .post<ApiResponse<ProposalDocument>>(`/proposals/${proposalId}/documents`, form)
      .then((res) => res.data.data);
  },

  remove: (proposalId: string, documentId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/proposals/${proposalId}/documents/${documentId}`),

  downloadUrl: (proposalId: string, documentId: string) =>
    `/api/proposals/${proposalId}/documents/${documentId}/download`,
};
