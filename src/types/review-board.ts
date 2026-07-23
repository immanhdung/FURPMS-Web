import type { CouncilMember } from "@/types/council-member";

// Khớp ReviewBoardDto của BE (FURPMS.Application/DTOs/ReviewRounds/ReviewBoardDto.cs).
export interface ReviewBoardProject {
  projectId: string;
  proposalId: string;
  titleVi: string;
  projectStatus: string;
}

export interface ReviewBoardProjectRound {
  projectId: string;
  titleVi: string;
  status: string;
  result?: string | null;
}

export interface ReviewBoardCouncil {
  id: string;
  status: string;
  projectIds: string[];
  members: CouncilMember[];
}

export interface ReviewBoardRound {
  id: string;
  roundNumber: number;
  dimension: string;
  roundType: string;
  status: string;
  result?: string | null;
  canDelete: boolean;
  projects: ReviewBoardProjectRound[];
  councils: ReviewBoardCouncil[];
}

export interface ReviewBoardData {
  projects: ReviewBoardProject[];
  rounds: ReviewBoardRound[];
}

export interface CreateTrackRoundPayload {
  dimension: string;
  roundType: string;
  rubricTemplateId?: number;
  prerequisiteRoundId?: string;
  /** Để trống → BE tự gom mọi đề tài SUBMITTED/REVISION của lĩnh vực chưa vào vòng. */
  projectIds?: string[];
}

export interface CouncilPackageMember {
  userId: string;
  memberRole: string;
  isExternal: boolean;
}

export interface CreateCouncilPackagePayload {
  councilType?: string;
  projectIds: string[];
  members: CouncilPackageMember[];
}
