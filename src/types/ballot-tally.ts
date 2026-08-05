/** BM12 mục 10.1 — "Kết quả bỏ phiếu đánh giá" của một đề tài trong một hội đồng. */
export interface MemberBallot {
  memberId: string;
  memberName: string;
  memberRole?: string | null;
  hasSubmitted: boolean;
  isValidBallot: boolean;
  /** Vòng XÉT DUYỆT chấm điểm (BM03 thang 100). */
  totalScore?: number | null;
  maxScore?: number | null;
  /** Vòng NGHIỆM THU chỉ Đạt/Không đạt (BM11 không có thang điểm). */
  result?: string | null;
  comments?: string | null;
  submittedAt?: string | null;
}

export interface BallotTally {
  councilId: string;
  projectId: string;
  isAcceptanceRound: boolean;
  /** = số phiếu phát ra (BM12: "Số phiếu phát ra"). */
  totalMembers: number;
  ballotsReturned: number;
  validBallots: number;
  invalidBallots: number;
  passCount: number;
  failCount: number;
  averageScore?: number | null;
  ballots: MemberBallot[];
}
