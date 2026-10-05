import type { Role } from "@/constants/roles";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  department?: string | null;
  /** Học vị — BE trả CHUỖI tiếng Việt ("Tiến sĩ"), không phải mã số. */
  academicDegree?: string | null;
  roles: Role[];
  /**
   * Khớp `UserDto` của BE. Trước đây khai `status?: string` — BE **không có** trường đó (chỉ có
   * `isActive`), nên ô Trạng thái ở màn chi tiết luôn trống mà TypeScript không kêu gì.
   */
  isActive?: boolean;
  accountType?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
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

/**
 * Học vị gửi lên BE bằng MÃ SỐ (BE đổi mã → chuỗi tiếng Việt khi lưu vào hồ sơ khoa học),
 * nhưng đọc về là CHUỖI. Nhãn để tiếng Việt cho khớp giao diện.
 */
export const ACADEMIC_DEGREES = [
  { value: 0, label: "Cử nhân" },
  { value: 1, label: "Thạc sĩ" },
  { value: 2, label: "Tiến sĩ" },
  { value: 3, label: "Giáo sư" },
] as const;
