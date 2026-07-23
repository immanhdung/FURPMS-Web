import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ProposalListParams, ProposalSummary } from "@/types/proposal-summary";
import type { ProposalDetail, ProposalPayload } from "@/types/proposal-detail";

/** Trigger a browser file download for a blob response. */
function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const proposalService = {
  list: (params?: ProposalListParams) =>
    axiosClient.get<ApiResponse<ProposalSummary[]>>("/proposals", { params }).then((res) => res.data.data),

  mine: () => axiosClient.get<ApiResponse<ProposalSummary[]>>("/proposals/my").then((res) => res.data.data),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<ProposalDetail>>(`/proposals/${id}`).then((res) => res.data.data),

  create: (payload: ProposalPayload) =>
    axiosClient.post<ApiResponse<ProposalDetail>>("/proposals", payload).then((res) => res.data.data),

  update: (id: string, payload: ProposalPayload) =>
    axiosClient.put<ApiResponse<ProposalDetail>>(`/proposals/${id}`, payload).then((res) => res.data.data),

  submit: (id: string, confirmCv: boolean) =>
    axiosClient
      .post<ApiResponse<ProposalDetail>>(`/proposals/${id}/submit`, null, { params: { confirmCv } })
      .then((res) => res.data.data),

  withdraw: (id: string) =>
    axiosClient.patch<ApiResponse<ProposalDetail>>(`/proposals/${id}/withdraw`).then((res) => res.data.data),

  /** Export thuyết minh khoa học — Mẫu 1 (Word/PDF). */
  exportScientific: async (id: string, titleSlug: string) => {
    const res = await axiosClient.get<Blob>(`/proposals/${id}/export/scientific`, {
      responseType: "blob",
    });
    downloadBlob(res.data, `thuyet-minh-${titleSlug}.docx`);
  },

  /** Export dự toán kinh phí — Mẫu 3 (Excel). */
  exportBudget: async (id: string, titleSlug: string) => {
    const res = await axiosClient.get<Blob>(`/proposals/${id}/export/budget`, {
      responseType: "blob",
    });
    downloadBlob(res.data, `du-toan-${titleSlug}.xlsx`);
  },
};

