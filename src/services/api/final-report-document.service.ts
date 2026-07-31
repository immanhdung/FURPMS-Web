import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProposalDocument } from "@/types/proposal-document";

/**
 * File báo cáo tổng kết (BM09 — góp ý thầy 29/07: upload PDF thay vì dán URL).
 * Upload xong lấy `downloadUrl` để nộp kèm báo cáo, thay cho ô nhập link thủ công.
 */
export const finalReportDocumentService = {
  list: (contractId: string) =>
    axiosClient
      .get<ApiResponse<ProposalDocument[]>>(`/final-reports/${contractId}/documents`)
      .then((res) => res.data.data),

  upload: (contractId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return axiosClient
      .post<ApiResponse<ProposalDocument>>(`/final-reports/${contractId}/documents`, form)
      .then((res) => res.data.data);
  },
};
