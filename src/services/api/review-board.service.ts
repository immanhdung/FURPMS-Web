import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type {
  CreateCouncilPackagePayload,
  CreateTrackRoundPayload,
  ReviewBoardCouncil,
  ReviewBoardData,
} from "@/types/review-board";
import type { ReviewRound } from "@/types/review-round";

// Màn "Hội đồng & Chấm" cấp lĩnh vực — tiêu thụ ReviewBoardController của BE.
export const reviewBoardService = {
  getBoard: (cycleId: number, trackId: number) =>
    axiosClient
      .get<ApiResponse<ReviewBoardData>>(`/cycles/${cycleId}/tracks/${trackId}/review-board`)
      .then((res) => res.data.data),

  createRound: (cycleId: number, trackId: number, payload: CreateTrackRoundPayload) =>
    axiosClient
      .post<ApiResponse<ReviewRound>>(`/cycles/${cycleId}/tracks/${trackId}/rounds`, payload)
      .then((res) => res.data.data),

  deleteRound: (roundId: string) =>
    axiosClient.delete<ApiResponse>(`/rounds/${roundId}`).then((res) => res.data),

  addProject: (roundId: string, projectId: string) =>
    axiosClient.post<ApiResponse>(`/rounds/${roundId}/projects`, { projectId }).then((res) => res.data),

  removeProject: (roundId: string, projectId: string) =>
    axiosClient.delete<ApiResponse>(`/rounds/${roundId}/projects/${projectId}`).then((res) => res.data),

  createCouncilPackage: (roundId: string, payload: CreateCouncilPackagePayload) =>
    axiosClient
      .post<ApiResponse<ReviewBoardCouncil>>(`/rounds/${roundId}/councils`, payload)
      .then((res) => res.data.data),

  // Gán / gỡ 1 đề tài vào hội đồng có sẵn (dropdown ở cột đề tài).
  assignProjectToCouncil: (councilId: string, projectId: string) =>
    axiosClient.post<ApiResponse>(`/councils/${councilId}/projects`, { projectId }).then((res) => res.data),

  removeProjectFromCouncil: (councilId: string, projectId: string) =>
    axiosClient.delete<ApiResponse>(`/councils/${councilId}/projects/${projectId}`).then((res) => res.data),
};
