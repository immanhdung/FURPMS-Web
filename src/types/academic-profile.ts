export interface AcademicProfile {
  userId: string;
  academicTitle?: string | null;
  scientificRank?: string | null;
  degreeLevel?: string | null;
  specialization?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  hometown?: string | null;
  nationality?: string | null;
  gsPgsYear?: number | null;
  gsPgsInstitution?: string | null;
  isiScopusCount: number;
  intlJournalCount: number;
  domesticJournalCount: number;
  intlConferenceCount: number;
  domesticConferenceCount: number;
  patentsCount: number;
  phdSupervisedCount: number;
  masterSupervisedCount: number;
  institution?: string | null;
  institutionAddress?: string | null;
  specializationAreas?: string | null;
  updatedAt?: string | null;
}

export type AcademicProfilePayload = Omit<AcademicProfile, "userId" | "updatedAt">;
