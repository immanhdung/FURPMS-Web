import type { ResearchType } from "@/types/research-type";

export const researchTypesStore: ResearchType[] = [
  {
    id: 1,
    code: "BASIC",
    name: "Basic Research",
    maxBudgetCap: 150_000_000,
    requireOrderingUnit: false,
    isActive: true,
  },
  {
    id: 2,
    code: "APPLIED",
    name: "Applied Research",
    maxBudgetCap: 400_000_000,
    requireOrderingUnit: true,
    isActive: true,
  },
];

let nextId = 3;

export function getNextResearchTypeId() {
  return nextId++;
}
