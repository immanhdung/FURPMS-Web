export interface KpiDatum {
  id: string;
  label: string;
  value: number;
  format?: "number" | "percent" | "currency";
  deltaLabel?: string;
}

export interface TrendPoint {
  label: string;
  submitted: number;
  approved: number;
}

export interface FieldDistributionPoint {
  field: string;
  count: number;
}

export interface BudgetSlice {
  category: string;
  amount: number;
}

export interface ReviewProgressPoint {
  label: string;
  completed: number;
  pending: number;
}

export interface CouncilPerformancePoint {
  council: string;
  score: number;
}

export interface ProposalStatusSlice {
  status: string;
  count: number;
}

export interface DeadlineBucket {
  type: string;
  count: number;
}

export interface ReviewDecisionSlice {
  decision: string;
  count: number;
}

export type ActivityType = "proposal" | "review" | "council" | "meeting" | "contract" | "system";

export interface ActivityItem {
  id: string;
  message: string;
  actor: string;
  timestamp: string;
  type: ActivityType;
}

export interface AdminDashboardData {
  kpis: KpiDatum[];
  monthlyTrend: TrendPoint[];
  proposalsByField: FieldDistributionPoint[];
  budgetDistribution: BudgetSlice[];
  reviewProgress: ReviewProgressPoint[];
  activity: ActivityItem[];
}

export interface StaffDashboardData {
  kpis: KpiDatum[];
  reviewProgress: ReviewProgressPoint[];
  councilPerformance: CouncilPerformancePoint[];
  activity: ActivityItem[];
}

export interface PiDashboardData {
  kpis: KpiDatum[];
  proposalStatus: ProposalStatusSlice[];
  upcomingDeadlines: DeadlineBucket[];
  aiSuggestions: string[];
  activity: ActivityItem[];
}

export interface ReviewerDashboardData {
  kpis: KpiDatum[];
  reviewCompletionTrend: ReviewProgressPoint[];
  reviewDecisions: ReviewDecisionSlice[];
  activity: ActivityItem[];
}
