/**
 * GET /api/analytics/overview, /api/analytics/by-track, /api/analytics/funnel are real endpoints
 * but have no documented response schema in Swagger. Every field here is optional and the UI
 * renders defensively (empty states / fallbacks) so it degrades gracefully if the real shape
 * differs once verified against an authenticated response.
 */
export interface AnalyticsOverview {
  totalCycles?: number;
  totalProposals?: number;
  approvedProposals?: number;
  rejectedProposals?: number;
  pendingReviews?: number;
  totalCouncils?: number;
  totalContracts?: number;
  totalBudget?: number;
  monthlyTrend?: { label: string; submitted: number; approved: number }[];
  reviewProgress?: { label: string; completed: number; pending: number }[];
  budgetDistribution?: { category: string; amount: number }[];
  councilPerformance?: { council: string; score: number }[];
}

export interface TrackAnalyticsItem {
  trackId?: string;
  trackName?: string;
  proposalCount?: number;
  approvedCount?: number;
}

export interface FunnelStageItem {
  stage?: string;
  count?: number;
}
