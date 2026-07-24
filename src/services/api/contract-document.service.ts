import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProposalDocument } from "@/types/proposal-document";

/** Hồ sơ hợp đồng (BM05) — bản Word đã ký/scan upload lên làm minh chứng. */
export const contractDocumentService = {
  list: (contractId: string) =>
    axiosClient
      .get<ApiResponse<ProposalDocument[]>>(`/contracts/${contractId}/documents`)
      .then((res) => res.data.data),

  upload: (contractId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return axiosClient
      .post<ApiResponse<ProposalDocument>>(`/contracts/${contractId}/documents`, form)
      .then((res) => res.data.data);
  },

  downloadBlob: (contractId: string, documentId: string) =>
    axiosClient
      .get<Blob>(`/contracts/${contractId}/documents/${documentId}/download`, { responseType: "blob" })
      .then((res) => res.data),
};
