import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { CreateTrackPayload, Track, UpdateTrackPayload } from "@/types/track";

export const trackService = {
  list: () => axiosClient.get<ApiResponse<Track[]>>("/cycles/tracks").then((res) => res.data.data),

  create: (payload: CreateTrackPayload) =>
    axiosClient.post<ApiResponse<Track>>("/cycles/tracks", payload).then((res) => res.data.data),

  update: (id: number, payload: UpdateTrackPayload) =>
    axiosClient.put<ApiResponse<Track>>(`/cycles/tracks/${id}`, payload).then((res) => res.data.data),

  assignOwner: (id: number, ownerId: string) =>
    axiosClient.patch<ApiResponse<Track>>(`/cycles/tracks/${id}/owner`, { ownerId }).then((res) => res.data.data),

  deactivate: (id: number) =>
    axiosClient.patch<ApiResponse<Track>>(`/cycles/tracks/${id}/deactivate`).then((res) => res.data.data),
};
