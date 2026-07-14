import type { PiDashboardData, ReviewerDashboardData, StaffDashboardData } from "@/types/dashboard";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const MOCK_STAFF_DASHBOARD: StaffDashboardData = {
  kpis: [
    { id: "review-progress", label: "Review Progress", value: 68, format: "percent", deltaLabel: "+12% this week" },
    { id: "upcoming-meetings", label: "Upcoming Meetings", value: 5, format: "number", deltaLabel: "Next in 2 days" },
    { id: "pending-invitations", label: "Pending Invitations", value: 9, format: "number", deltaLabel: "3 expiring soon" },
    { id: "council-performance", label: "Council Performance", value: 82, format: "percent", deltaLabel: "+4% vs last cycle" },
  ],
  reviewProgress: [
    { label: "W1", completed: 8, pending: 22 },
    { label: "W2", completed: 15, pending: 17 },
    { label: "W3", completed: 24, pending: 12 },
    { label: "W4", completed: 30, pending: 6 },
  ],
  councilPerformance: [
    { council: "AI & DS Board", score: 88 },
    { council: "IT Systems Board", score: 79 },
    { council: "Business Board", score: 74 },
    { council: "Language Board", score: 91 },
  ],
  activity: [
    { id: "s1", message: "accepted invitation to council 'IT Systems Board'", actor: "Pham Thi Reviewer", timestamp: hoursAgo(2), type: "council" },
    { id: "s2", message: "submitted review for 'Campus Navigation App'", actor: "Nguyen Van Reviewer", timestamp: hoursAgo(5), type: "review" },
    { id: "s3", message: "requested reschedule for council meeting", actor: "Le Van Faculty", timestamp: hoursAgo(9), type: "meeting" },
    { id: "s4", message: "declined invitation to council 'Economics Board'", actor: "Do Van Reviewer", timestamp: hoursAgo(15), type: "council" },
  ],
};

export const MOCK_PI_DASHBOARD: PiDashboardData = {
  kpis: [
    { id: "my-proposals", label: "My Proposals", value: 4, format: "number", deltaLabel: "1 in draft" },
    { id: "approved", label: "Approved", value: 2, format: "number", deltaLabel: "50% approval rate" },
    { id: "under-review", label: "Under Review", value: 1, format: "number", deltaLabel: "Est. 5 days left" },
    { id: "deadlines", label: "Upcoming Deadlines", value: 3, format: "number", deltaLabel: "Next in 4 days" },
  ],
  proposalStatus: [
    { status: "Draft", count: 1 },
    { status: "Submitted", count: 1 },
    { status: "Under Review", count: 1 },
    { status: "Approved", count: 2 },
    { status: "Rejected", count: 0 },
  ],
  upcomingDeadlines: [
    { type: "Progress Report", count: 1 },
    { type: "Final Report", count: 1 },
    { type: "Reviewer Response", count: 1 },
  ],
  aiSuggestions: [
    "Your abstract for 'AI-based Plagiarism Detection' could better highlight novelty vs. related work.",
    "Consider adding a data availability statement to strengthen your Applied Research submission.",
    "Similar proposals in Data Science often include a risk mitigation plan — yours currently lacks one.",
  ],
  activity: [
    { id: "p1", message: "Your proposal 'AI-based Plagiarism Detection' moved to Under Review", actor: "System", timestamp: hoursAgo(4), type: "proposal" },
    { id: "p2", message: "Reviewer left feedback on 'Smart Campus IoT Platform'", actor: "Pham Thi Reviewer", timestamp: hoursAgo(8), type: "review" },
    { id: "p3", message: "Progress report due in 4 days for 'Smart Campus IoT Platform'", actor: "System", timestamp: hoursAgo(12), type: "system" },
  ],
};

export const MOCK_REVIEWER_DASHBOARD: ReviewerDashboardData = {
  kpis: [
    { id: "pending-reviews", label: "Pending Reviews", value: 6, format: "number", deltaLabel: "2 due this week" },
    { id: "assigned-councils", label: "Assigned Councils", value: 3, format: "number", deltaLabel: "1 new invitation" },
    { id: "completion-rate", label: "Review Completion Rate", value: 91, format: "percent", deltaLabel: "+3% vs last cycle" },
    { id: "upcoming-meetings", label: "Upcoming Meetings", value: 2, format: "number", deltaLabel: "Next in 1 day" },
  ],
  reviewCompletionTrend: [
    { label: "W1", completed: 4, pending: 8 },
    { label: "W2", completed: 7, pending: 5 },
    { label: "W3", completed: 10, pending: 3 },
    { label: "W4", completed: 13, pending: 1 },
  ],
  reviewDecisions: [
    { decision: "Approved", count: 18 },
    { decision: "Revision Required", count: 7 },
    { decision: "Rejected", count: 4 },
  ],
  activity: [
    { id: "r1", message: "You accepted invitation to 'AI & Data Science Review Board'", actor: "You", timestamp: hoursAgo(3), type: "council" },
    { id: "r2", message: "You submitted a score for 'Blockchain Voting System'", actor: "You", timestamp: hoursAgo(7), type: "review" },
    { id: "r3", message: "Council meeting scheduled for tomorrow 09:00", actor: "Tran Thi Staff", timestamp: hoursAgo(14), type: "meeting" },
  ],
};
