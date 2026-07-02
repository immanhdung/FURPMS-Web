export interface SummaryResult {
  summary: string;
  highlights: string[];
}

export interface SemanticSearchResult {
  id: string;
  title: string;
  snippet: string;
  relevance: number;
  type: "proposal" | "topic";
}

export interface ReviewerSuggestion {
  userId: string;
  fullName: string;
  matchScore: number;
  reason: string;
}

export interface AiFeedbackItem {
  category: string;
  suggestion: string;
}
