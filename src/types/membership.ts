export interface MyMembership {
  memberId: string;
  councilId: string;
  roundId?: string | null;
  roundType?: string | null;
  roundStatus?: string | null;
  memberRole?: string | null;
  status?: string | null;
  proposalId: string;
  proposalTitleVI?: string | null;
  proposalStatus?: string | null;
}
