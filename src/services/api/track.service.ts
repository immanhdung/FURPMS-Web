import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CreateTrackPayload, Track, UpdateTrackPayload } from "@/types/track";

export const trackService = {
  list: () => axiosClient.get<ApiResponse<Track[]>>("/cycles/tracks").then((res) => res.data.data),

  // Fields actually attached to a cycle (via cycle_track). Prefer this in submission flows so
  // global-but-unattached fields (e.g. an orphan track) don't appear as choices.
  listByCycle: (cycleId: number) =>
    axiosClient.get<ApiResponse<Track[]>>(`/cycles/${cycleId}/tracks`).then((res) => res.data.data),

  // A field is always attached to a cycle on creation — there's no "unattached" track anymore.
  create: (cycleId: number, payload: CreateTrackPayload) =>
    axiosClient.post<ApiResponse<Track>>(`/cycles/${cycleId}/tracks`, payload).then((res) => res.data.data),

  update: (id: number, payload: UpdateTrackPayload) =>
    axiosClient.put<ApiResponse<Track>>(`/cycles/tracks/${id}`, payload).then((res) => res.data.data),

  assignOwner: (id: number, ownerId: string) =>
    axiosClient.patch<ApiResponse<Track>>(`/cycles/tracks/${id}/owner`, { ownerId }).then((res) => res.data.data),

  deactivate: (id: number) =>
    axiosClient.patch<ApiResponse<Track>>(`/cycles/tracks/${id}/deactivate`).then((res) => res.data.data),
};
