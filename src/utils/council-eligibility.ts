import { ROLES } from "@/constants/roles";
import type { AdminUser } from "@/types/user";

/**
 * Ai được đứng tên trong hội đồng chấm.
 *
 * QĐ543 Điều 8.2 / 12.2: hội đồng gồm các nhà khoa học, giảng viên có chuyên môn — nên danh sách
 * chọn chỉ lấy người mang vai **Giảng viên** hoặc **Hội đồng**.
 *
 * Lọc theo "ai ĐỦ TƯ CÁCH" chứ không phải cấm riêng vai Quản trị: tài khoản quản trị là tài khoản
 * kỹ thuật nên tự nhiên rớt khỏi danh sách, mà một người vừa quản trị vừa là giảng viên thì vẫn
 * vào hội đồng được — điều hoàn toàn hợp lệ. Nếu viết "loại Admin" thì trường hợp thứ hai bị chặn oan.
 */
export function isCouncilEligible(user: AdminUser): boolean {
  return user.roles.includes(ROLES.FACULTY) || user.roles.includes(ROLES.REVIEW_COMMITTEE);
}

/**
 * Danh sách chọn ủy viên: bỏ người không đủ tư cách, bỏ tài khoản đã khoá, và bỏ **chủ nhiệm các
 * đề tài mà hội đồng này chấm** (COI — rule #5).
 *
 * COI đã được chặn ở BE (`AssertNoCoiAsync`, cả lúc thêm ủy viên lẫn lúc gán đề tài vào hội đồng),
 * nên đây KHÔNG phải hàng rào an ninh — nó chỉ để danh sách không hiện ra cái tên mà bấm vào là
 * báo lỗi. Hàng rào thật vẫn nằm ở BE và phải giữ nguyên ở đó.
 *
 * @param piUserIds Chủ nhiệm của những đề tài trong vòng/hội đồng đang thao tác.
 */
export function eligibleCouncilCandidates(
  users: AdminUser[] | undefined,
  piUserIds: Iterable<string> = []
): AdminUser[] {
  const excluded = new Set(piUserIds);
  return (users ?? []).filter(
    (u) => isCouncilEligible(u) && u.isActive !== false && !excluded.has(u.id)
  );
}
