import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { DuplicateCheck, ReviewDuplicatePayload } from "@/types/duplicate-check";

/** Tầng 2 gọi Gemini nên chậm hơn hẳn — nới thời gian chờ riêng cho nó. */
const EXPLAIN_TIMEOUT_MS = 90_000;

export const duplicateCheckService = {
  /** Đọc thuần — không gọi AI, không tốn quota. */
  get: (proposalId: string) =>
    axiosClient
      .get<ApiResponse<DuplicateCheck>>(`/proposals/${proposalId}/duplicate-check`)
      .then((res) => res.data.data),

  /** Chạy tầng 2. Có bản đã lưu thì trả lại bản đó; `force` mới gọi lại Gemini. */
  explain: (proposalId: string, force = false) =>
    axiosClient
      .post<ApiResponse<DuplicateCheck>>(
        `/proposals/${proposalId}/duplicate-check/explain`,
        null,
        { params: { force }, timeout: EXPLAIN_TIMEOUT_MS }
      )
      .then((res) => res.data.data),

  review: (proposalId: string, payload: ReviewDuplicatePayload) =>
    axiosClient
      .post<ApiResponse<DuplicateCheck>>(`/proposals/${proposalId}/duplicate-check/review`, payload)
      .then((res) => res.data.data),
};
