import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/common";

/** A document record from the global repository endpoint. */
export interface GlobalDocument {
  id: string;
  proposalId: string;
  proposalTitle?: string | null;
  fileName: string;
  documentType?: string | null;
  fileSizeBytes: number;
  uploadedAt: string;
  downloadUrl?: string | null;
}

export const globalDocumentService = {
  /** GET /api/documents — list all documents system-wide (Staff/Admin). */
  list: (params?: PaginationParams) =>
    axiosClient
      .get<ApiResponse<PaginatedResponse<GlobalDocument>>>("/documents", { params })
      .then((res) => res.data.data),

  /** GET /api/documents?proposalId=xxx — filter by proposal. */
  listByProposal: (proposalId: string) =>
    axiosClient
      .get<ApiResponse<PaginatedResponse<GlobalDocument>>>("/documents", {
        params: { proposalId },
      })
      .then((res) => res.data.data),
};
