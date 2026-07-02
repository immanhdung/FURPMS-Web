export interface FeedbackPayload {
  urgencyScore?: number;
  scientificContributionScore?: number;
  practicalSignificanceScore?: number;
  actualVsExpectedScore?: number;
  otherComments?: string;
  overallAssessment?: string;
}

export interface FeedbackResponse extends FeedbackPayload {
  id: string;
  councilId: string;
  reviewerId?: string;
  submittedAt?: string | null;
}
