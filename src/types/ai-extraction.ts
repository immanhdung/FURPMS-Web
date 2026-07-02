export interface AiExtractionResult {
  titleEN: string;
  titleVI?: string;
  abstractEN: string;
  keywords: string[];
  researchArea: string;
}

export interface SimilarityCheckResult {
  score: number;
  passed: boolean;
}
