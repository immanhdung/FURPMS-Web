import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { Contract, CreateContractPayload, UpdateContractPayload } from "@/types/contract";

export const contractService = {
  // mine=true → chỉ HĐ mình là PI (dùng cho trang PI: báo cáo tiến độ/sản phẩm/tổng kết).
  list: (mine = false) =>
    axiosClient.get<ApiResponse<Contract[]>>("/contracts", { params: mine ? { mine: true } : undefined }).then((res) => res.data.data),

  getById: (id: string) => axiosClient.get<ApiResponse<Contract>>(`/contracts/${id}`).then((res) => res.data.data),

  create: (payload: CreateContractPayload) =>
    axiosClient.post<ApiResponse<Contract>>("/contracts", payload).then((res) => res.data.data),

  /** Sửa phần "giấy tờ" Staff gõ tay. BE không cho đổi đề tài / tổng kinh phí. */
  update: (id: string, payload: UpdateContractPayload) =>
    axiosClient.put<ApiResponse<Contract>>(`/contracts/${id}`, payload).then((res) => res.data.data),

  /** Chỉ xoá được hợp đồng CHƯA KÝ và chưa có ai nộp gì lên — BE chặn, trả 409 kèm lý do. */
  remove: (id: string) => axiosClient.delete<ApiResponse<null>>(`/contracts/${id}`),

  /** Ghi nhận đã ký. `signedOn` = ngày ký GHI TRÊN GIẤY (yyyy-MM-dd), khác ngày bấm nút. */
  sign: (id: string, signedOn?: string) =>
    axiosClient
      .post<ApiResponse<Contract>>(`/contracts/${id}/sign`, null, { params: signedOn ? { signedOn } : undefined })
      .then((res) => res.data.data),

  // BM05 — tự sinh Word hợp đồng (rule tuần 10). Tải qua axios (kèm token) rồi lưu file.
  exportWord: (id: string) =>
    axiosClient.get<Blob>(`/contracts/${id}/export-word`, { responseType: "blob" }).then((res) => res.data),

  /** BM13 — Biên bản nghiệm thu & thanh lý hợp đồng (QĐ543 Điều 13.2). */
  exportSettlementWord: (id: string) =>
    axiosClient
      .get<Blob>(`/contracts/${id}/export-settlement-word`, { responseType: "blob" })
      .then((res) => res.data),
};
