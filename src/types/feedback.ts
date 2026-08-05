export interface FeedbackPayload {
  urgencyScore?: number;
  scientificContributionScore?: number;
  practicalSignificanceScore?: number;
  actualVsExpectedScore?: number;
  otherComments?: string;
  overallAssessment?: string;
}

/** ⚠️ Cùng lỗi với ScoreResponse: BE trả `reviewerMemberId` + `reviewerName`, không có `reviewerId`. */
export interface FeedbackResponse extends FeedbackPayload {
  id: number;
  councilId: string;
  reviewerMemberId: string;
  reviewerName?: string | null;
  submittedAt?: string | null;
}
