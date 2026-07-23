import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { ConfirmDisbursementPayload, Disbursement } from "@/types/disbursement";

export const disbursementService = {
  listByContract: (contractId: string) =>
    axiosClient
      .get<ApiResponse<Disbursement[]>>(`/contracts/${contractId}/disbursements`)
      .then((res) => res.data.data),

  /** Sinh lịch giải ngân theo phương thức cấp kinh phí của đề tài (WHOLE/PARTIAL). Chỉ chạy được 1 lần. */
  generate: (contractId: string) =>
    axiosClient
      .post<ApiResponse<Disbursement[]>>(`/contracts/${contractId}/disbursements/generate`)
      .then((res) => res.data.data),

  /** Staff xác nhận đã chi tiền thật (rule #3 — hệ thống không tự chuyển khoản). */
  confirm: (id: number, payload: ConfirmDisbursementPayload) =>
    axiosClient
      .post<ApiResponse<Disbursement>>(`/disbursements/${id}/confirm`, payload)
      .then((res) => res.data.data),
};
