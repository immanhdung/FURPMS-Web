import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";

export interface ProposalActivity {
  id: number;
  contentId: number;
  activityName: string;
  expectedResult?: string | null;
  startMonth?: number | null;
  endMonth?: number | null;
  sequence: number;
}

export interface ResearchContent {
  id: number;
  contentNumber?: string | null;
  title: string;
  description?: string | null;
  sequence: number;
  activities: ProposalActivity[];
}

/**
 * Nội dung nghiên cứu + hoạt động của đề cương. Dùng cho BẢNG TIẾN ĐỘ THEO HOẠT ĐỘNG của
 * BM06 (mục bảng chi tiết) — PI báo tiến độ từng hoạt động đã cam kết, không chỉ viết văn xuôi.
 */
export const researchContentService = {
  listByProposal: (proposalId: string) =>
    axiosClient
      .get<ApiResponse<ResearchContent[]>>(`/proposals/${proposalId}/research-contents`)
      .then((res) => res.data.data),
};
