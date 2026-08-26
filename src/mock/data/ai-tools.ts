import type { AiFeedbackItem, SemanticSearchResult, SummaryResult } from "@/types/ai-tools";

export const SAMPLE_SUMMARIES: SummaryResult[] = [
  {
    id: "mock-summary-1",
    proposalId: "mock-proposal-1",
    summaryText:
      "This proposal investigates a transformer-based approach to detecting plagiarism across academic manuscripts, combining semantic embeddings with citation-graph analysis to improve precision over traditional n-gram methods.",
    isEditedByHuman: false,
    generatedAt: "2026-08-01T00:00:00Z",
    source: "textFields",
  },
  {
    id: "mock-summary-2",
    proposalId: "mock-proposal-2",
    summaryText:
      "The project proposes a lightweight IoT architecture for real-time environmental monitoring across university campuses, using low-power sensor nodes with edge-based anomaly detection to reduce cloud dependency.",
    isEditedByHuman: false,
    generatedAt: "2026-08-01T00:00:00Z",
    source: "textFields",
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


