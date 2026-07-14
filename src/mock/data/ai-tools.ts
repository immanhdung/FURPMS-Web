import type { AiFeedbackItem, ReviewerSuggestion, SemanticSearchResult, SummaryResult } from "@/types/ai-tools";

export const SAMPLE_SUMMARIES: SummaryResult[] = [
  {
    summary:
      "This proposal investigates a transformer-based approach to detecting plagiarism across academic manuscripts, combining semantic embeddings with citation-graph analysis to improve precision over traditional n-gram methods.",
    highlights: [
      "Novel combination of transformer embeddings and citation graphs",
      "Evaluated on a corpus of 10,000+ published papers",
      "Reports 12% precision improvement over baseline methods",
    ],
  },
  {
    summary:
      "The project proposes a lightweight IoT architecture for real-time environmental monitoring across university campuses, using low-power sensor nodes with edge-based anomaly detection to reduce cloud dependency.",
    highlights: [
      "Energy-efficient edge computing architecture",
      "Real-time anomaly detection at the sensor level",
      "Pilot deployment planned across 3 campus buildings",
    ],
  },
];

export const SAMPLE_SEARCH_RESULTS: SemanticSearchResult[] = [
  {
    id: "sr-1",
    title: "Deep Learning Approaches for Automated Plagiarism Detection",
    snippet: "A transformer-based semantic similarity framework for detecting plagiarism across academic manuscripts...",
    relevance: 94,
    type: "proposal",
  },
  {
    id: "sr-2",
    title: "Smart Campus IoT Environmental Monitoring",
    snippet: "An energy-efficient IoT architecture for real-time environmental monitoring across university campuses...",
    relevance: 88,
    type: "proposal",
  },
  {
    id: "sr-3",
    title: "Predictive Analytics for Student Retention",
    snippet: "An ensemble machine learning pipeline to predict at-risk students early in the academic term...",
    relevance: 76,
    type: "proposal",
  },
  {
    id: "sr-4",
    title: "Website Development for Alumni Engagement Portal",
    snippet: "Applied research topic ordered by the Alumni Relations Office to build a modern engagement platform...",
    relevance: 61,
    type: "topic",
  },
];

export const SAMPLE_FEEDBACK: AiFeedbackItem[] = [
  { category: "Novelty", suggestion: "Consider clarifying how this approach differs from prior transformer-based plagiarism detection work published in the last 2 years." },
  { category: "Methodology", suggestion: "The evaluation dataset size is not specified — adding a concrete sample size will strengthen the methodology section." },
  { category: "Budget", suggestion: "Personnel costs appear high relative to similar-scale proposals in this field; consider a brief justification." },
  { category: "Risk", suggestion: "No risk mitigation plan is mentioned — proposals in Data Science with a mitigation plan have a higher approval rate historically." },
];

const SAMPLE_REVIEWER_POOL = [
  "Dr. Nguyen Thi Hoa",
  "Assoc. Prof. Tran Van Minh",
  "Dr. Le Thi Lan",
  "Prof. Pham Quoc Bao",
  "Dr. Vo Thanh Tung",
];

export function getReviewerSuggestions(): ReviewerSuggestion[] {
  const reasons = [
    "Published 3+ papers in this research area within the last 2 years",
    "Previously reviewed 5 proposals in a related track with high consistency scores",
    "Department affiliation closely matches the proposal's research field",
    "Available capacity — currently assigned to fewer than 2 active councils",
  ];
  return SAMPLE_REVIEWER_POOL.slice(0, 4).map((name, index) => ({
    userId: `suggested-${index}`,
    fullName: name,
    matchScore: 92 - index * 8,
    reason: reasons[index % reasons.length],
  }));
}
