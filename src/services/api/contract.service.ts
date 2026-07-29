import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { Contract, CreateContractPayload } from "@/types/contract";

export const contractService = {
  // mine=true → chỉ HĐ mình là PI (dùng cho trang PI: báo cáo tiến độ/sản phẩm/tổng kết).
  list: (mine = false) =>
    axiosClient.get<ApiResponse<Contract[]>>("/contracts", { params: mine ? { mine: true } : undefined }).then((res) => res.data.data),

  getById: (id: string) => axiosClient.get<ApiResponse<Contract>>(`/contracts/${id}`).then((res) => res.data.data),

  create: (payload: CreateContractPayload) =>
    axiosClient.post<ApiResponse<Contract>>("/contracts", payload).then((res) => res.data.data),

  sign: (id: string) => axiosClient.post<ApiResponse<Contract>>(`/contracts/${id}/sign`).then((res) => res.data.data),

  // BM05 — tự sinh Word hợp đồng (rule tuần 10). Tải qua axios (kèm token) rồi lưu file.
  exportWord: (id: string) =>
    axiosClient.get<Blob>(`/contracts/${id}/export-word`, { responseType: "blob" }).then((res) => res.data),
};
