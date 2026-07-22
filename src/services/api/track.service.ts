import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CreateTrackPayload, Track, UpdateTrackPayload } from "@/types/track";

export const trackService = {
  list: () => axiosClient.get<ApiResponse<Track[]>>("/cycles/tracks").then((res) => res.data.data),

  // Fields actually attached to a cycle (via cycle_track). Prefer this in submission flows so
  // global-but-unattached fields (e.g. an orphan track) don't appear as choices.
  listByCycle: (cycleId: number) =>
    axiosClient.get<ApiResponse<Track[]>>(`/cycles/${cycleId}/tracks`).then((res) => res.data.data),

  // Lĩnh vực là dữ liệu DÙNG CHUNG (global) — tạo 1 lần, dùng cho mọi đợt. Liên kết đợt↔lĩnh vực
  // được tạo tự động khi PI nộp đề xuất vào (đợt, lĩnh vực).
  create: (payload: CreateTrackPayload) =>
    axiosClient.post<ApiResponse<Track>>(`/cycles/tracks`, payload).then((res) => res.data.data),

  update: (id: number, payload: UpdateTrackPayload) =>
    axiosClient.put<ApiResponse<Track>>(`/cycles/tracks/${id}`, payload).then((res) => res.data.data),

  // Gắn / gỡ 1 lĩnh vực CÓ SẴN vào đợt (đợt tự chọn lĩnh vực nó mở).
  attachToCycle: (cycleId: number, trackId: number) =>
    axiosClient.post<ApiResponse>(`/cycles/${cycleId}/tracks/${trackId}`).then((res) => res.data),

  detachFromCycle: (cycleId: number, trackId: number) =>
    axiosClient.delete<ApiResponse>(`/cycles/${cycleId}/tracks/${trackId}`).then((res) => res.data),

  assignOwner: (id: number, ownerId: string) =>
    axiosClient.patch<ApiResponse<Track>>(`/cycles/tracks/${id}/owner`, { ownerId }).then((res) => res.data.data),

  deactivate: (id: number) =>
    axiosClient.patch<ApiResponse<Track>>(`/cycles/tracks/${id}/deactivate`).then((res) => res.data.data),
};
