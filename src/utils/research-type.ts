import type { TFunction } from "i18next";
import type { ResearchType } from "@/types/research-type";

/**
 * Hai loại đề tài chuẩn là danh mục nghiệp vụ, nên tên hiển thị phải theo ngôn ngữ giao diện chứ
 * không lấy nguyên tên tiếng Việt trong DB. Mã lạ vẫn rơi về tên đã nhập để không làm mất danh mục
 * tùy biến nếu hệ thống bổ sung loại mới.
 */
export function researchTypeDisplayName(
  researchType: Pick<ResearchType, "code" | "name"> | null | undefined,
  t: TFunction
): string {
  if (!researchType) return "";

  const code = researchType.code.trim().toUpperCase();
  if (code !== "BASIC" && code !== "APPLIED") return researchType.name;

  return t(`researchTypes.knownNames.${code}`, { defaultValue: researchType.name });
}
