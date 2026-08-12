/**
 * Công trình khoa học trong lý lịch (QĐ543 — Biểu mẫu 02).
 *
 * Mỗi `AcademicWorkType` ứng với đúng **một mục của biểu mẫu**, nên khi hội đồng đối chiếu hồ sơ
 * với BM02 thì thấy khớp từng dòng. Trước đây phần này chỉ có các ô đếm số (mục 14.1–14.5) và bỏ
 * trắng toàn bộ phần liệt kê chi tiết mà biểu mẫu bắt buộc (14.6, 16.3, 17, 19.4).
 */
export const ACADEMIC_WORK_TYPES = [
  "PUBLICATION", // 14.6 — công trình đã công bố
  "PROJECT", // 17   — đề tài đã chủ trì / tham gia
  "BOOK", // 13   — sách, chuyên khảo, giáo trình
  "PATENT", // 15   — bằng sở hữu trí tuệ
  "APPLICATION", // 16.3 — sản phẩm ứng dụng, chuyển giao
  "AWARD", // 18   — giải thưởng
  "SUPERVISION", // 19.4 — hướng dẫn sau đại học
] as const;

export type AcademicWorkType = (typeof ACADEMIC_WORK_TYPES)[number];

/** Phân loại hợp lệ theo từng mục — phải khớp `WorkCategories.For()` bên máy chủ. */
export const WORK_CATEGORIES: Record<AcademicWorkType, readonly string[]> = {
  PUBLICATION: ["ISI_SCOPUS", "JOURNAL_INTL", "JOURNAL_DOMESTIC", "CONFERENCE_INTL", "CONFERENCE_DOMESTIC"],
  PROJECT: ["PROJECT_LEAD", "PROJECT_MEMBER"],
  BOOK: ["BOOK_MONOGRAPH", "BOOK_TEXTBOOK"],
  PATENT: ["PATENT_GRANTED"],
  APPLICATION: ["APPLIED_ABROAD", "APPLIED_DOMESTIC"],
  AWARD: ["AWARD_GENERAL"],
  SUPERVISION: ["PHD", "MASTER"],
};

/**
 * Vai trò hỏi thêm ở mục nào.
 *
 * **Mục 17 (đề tài) cố ý KHÔNG có ở đây**: biểu mẫu đã tách chủ trì (17.1) khỏi tham gia (17.2)
 * bằng chính hai mục con, nên phân loại `PROJECT_LEAD`/`PROJECT_MEMBER` đã mang đúng thông tin
 * đó rồi. Hỏi thêm vai trò là bắt người khai chọn cùng một thứ hai lần, và trên thẻ sẽ hiện hai
 * nhãn "Chủ trì" nằm cạnh nhau.
 */
export const WORK_ROLES: Partial<Record<AcademicWorkType, readonly string[]>> = {
  PUBLICATION: ["MAIN_AUTHOR", "CO_AUTHOR", "CORRESPONDING"],
  BOOK: ["MAIN_AUTHOR", "CO_AUTHOR"],
  SUPERVISION: ["MAIN_SUPERVISOR", "CO_SUPERVISOR"],
};

/** Ba giá trị nguyên văn BM02 mục 17 liệt kê cho "tình trạng nhiệm vụ". */
export const WORK_STATUSES = ["ACCEPTED", "IN_PROGRESS", "FAILED"] as const;

export interface AcademicWork {
  id: string;
  workType: AcademicWorkType;
  category: string;
  title: string;
  venue: string | null;
  authors: string | null;
  role: string | null;
  year: number | null;
  startYear: number | null;
  identifier: string | null;
  volume: string | null;
  pages: string | null;
  status: string | null;
  url: string | null;
  note: string | null;
  sortOrder: number;
}

export type AcademicWorkPayload = Omit<AcademicWork, "id">;

/**
 * Mục nào cần ô nhập nào. Biểu mẫu hỏi mỗi mục một kiểu — hiện đủ mọi ô cho mọi mục thì người
 * khai phải tự đoán ô nào bỏ trống, đúng kiểu form dài mà ai cũng ngại.
 */
export const WORK_FIELDS: Record<
  AcademicWorkType,
  { volume?: boolean; pages?: boolean; status?: boolean; startYear?: boolean; authors?: boolean }
> = {
  PUBLICATION: { volume: true, pages: true, authors: true },
  BOOK: { authors: true },
  PATENT: {},
  APPLICATION: { startYear: true },
  PROJECT: { status: true, startYear: true },
  AWARD: {},
  SUPERVISION: { startYear: true, authors: true },
};
