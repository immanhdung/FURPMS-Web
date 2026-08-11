import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

/**
 * Chuẩn hoá mã vai trước khi tra i18n. BE phần lớn trả PascalCase ("Chair"), nhưng có nhánh nhận
 * cả "Chairman" và so sánh không phân biệt hoa/thường (`CouncilService`, `CouncilMeetingService`),
 * nên dữ liệu cũ có thể là "CHAIR"/"chair". Nếu tra thẳng thì màn hình lòi ra đúng chữ BE gửi —
 * chính là kiểu lẫn Anh/Việt, hoa/thường mà thầy bắt lúc demo.
 */
const ROLE_ALIASES: Record<string, string> = {
  chair: "Chair",
  chairman: "Chair",
  secretary: "Secretary",
  opponent: "Opponent",
  member: "Member",
};

function canonicalRole(raw: string) {
  return ROLE_ALIASES[raw.trim().toLowerCase()] ?? raw.trim();
}

/** Nhãn VAI trong hội đồng (Chủ tịch / Thư ký / Phản biện / Thành viên). */
export function MemberRoleBadge({ role }: { role?: string | null }) {
  const { t } = useTranslation();
  if (!role) return null;
  const key = canonicalRole(role);
  return <Badge variant="outline">{t(`reviewBoard.role.${key}`, { defaultValue: key })}</Badge>;
}

/** Nhãn LOẠI VÒNG (Xét duyệt đề cương / Nghiệm thu). */
export function RoundTypeBadge({ type }: { type?: string | null }) {
  const { t } = useTranslation();
  if (!type) return null;
  return <Badge variant="secondary">{t(`reviewBoard.type.${type}`, { defaultValue: type })}</Badge>;
}

/** Dạng chữ trần, dùng trong ô bảng — cùng một nguồn nhãn với 2 badge ở trên. */
export function useRoleLabel() {
  const { t } = useTranslation();
  return {
    role: (r?: string | null) => {
      if (!r) return "-";
      const key = canonicalRole(r);
      return t(`reviewBoard.role.${key}`, { defaultValue: key });
    },
    roundType: (x?: string | null) => (x ? t(`reviewBoard.type.${x}`, { defaultValue: x }) : "-"),
  };
}
