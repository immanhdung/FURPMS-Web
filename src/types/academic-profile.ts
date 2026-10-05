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

/**
 * Phần **gửi lên** khi lưu hồ sơ.
 *
 * Các ô đếm công trình bị loại khỏi đây: từ 14/08 chúng là **số suy ra** — máy chủ cộng lại từ
 * bảng công trình sau mỗi lần thêm/sửa/xoá (QĐ543 BM02 mục 14.1–14.5, 15, 19.1/19.3 phải khớp
 * với danh sách chi tiết ở 14.6, 17, 19.4). Gửi số lên là ghi đè số đúng bằng số client đoán.
 */
export type AcademicProfilePayload = Omit<
  AcademicProfile,
  | "userId"
  | "updatedAt"
  | "isiScopusCount"
  | "intlJournalCount"
  | "domesticJournalCount"
  | "intlConferenceCount"
  | "domesticConferenceCount"
  | "patentsCount"
  | "phdSupervisedCount"
  | "masterSupervisedCount"
>;
