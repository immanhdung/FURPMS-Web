import type { Role } from "@/constants/roles";

export interface User {
  id: string;
  fullName: string;
  email: string;
  roles: Role[];
  avatarUrl?: string | null;
  status?: string | null;
  lastLoginAt?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
