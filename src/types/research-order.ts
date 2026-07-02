export interface ResearchOrder {
  id: number;
  cycleId: number;
  orderingUnitId: number;
  researchArea: string;
  problemDescription: string;
  expectedProducts: string;
  status?: string | null;
}

export interface CreateResearchOrderPayload {
  cycleId: number;
  orderingUnitId: number;
  researchArea: string;
  problemDescription: string;
  expectedProducts: string;
}
