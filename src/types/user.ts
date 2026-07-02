import type { Role } from "@/constants/roles";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  department?: string | null;
  academicDegree?: number | null;
  roles: Role[];
  status?: string | null;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  phoneNumber?: string;
  department?: string;
  academicDegree?: number;
  roles: number[];
  temporaryPassword: string;
}

export interface UpdateUserPayload {
  fullName: string;
  phoneNumber?: string;
  department?: string;
  academicDegree?: number;
  roles: number[];
}

/** Best-effort mapping — backend has no documented enum lookup for academicDegree. */
export const ACADEMIC_DEGREES = [
  { value: 0, label: "Bachelor" },
  { value: 1, label: "Master" },
  { value: 2, label: "Doctorate (PhD)" },
  { value: 3, label: "Professor" },
] as const;
