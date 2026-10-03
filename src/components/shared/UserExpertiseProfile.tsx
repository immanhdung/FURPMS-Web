import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { AcademicProfileSummary } from "@/features/admin/users/AcademicProfileSummary";
import { useAcademicWorksQuery } from "@/hooks/useAcademicWorks";
import { ACADEMIC_WORK_TYPES } from "@/types/academic-work";

/**
 * Danh sách công trình (QĐ543 Biểu mẫu 02) của MỘT người, chỉ xem — gom theo mục của biểu mẫu.
 * Dùng ở chi tiết người dùng (Admin) và khi Phòng QLKH chọn thành viên hội đồng.
 */
export function AcademicWorksList({ userId, limitPerType = 5 }: { userId: string; limitPerType?: number }) {
  const { t } = useTranslation();
  const { data: works, isLoading } = useAcademicWorksQuery(userId);

  if (isLoading) return <Skeleton className="h-16 w-full" />;
  if (!works || works.length === 0)
    return <p className="text-sm text-muted-foreground">{t("userExpertise.noWorks")}</p>;

  return (
    <div className="space-y-3">
      {ACADEMIC_WORK_TYPES.map((type) => {
        const items = works.filter((w) => w.workType === type);
        if (items.length === 0) return null;
        return (
          <div key={type}>
            <p className="text-xs font-medium text-foreground">
              {t(`academicWorks.type.${type}`)} <span className="text-muted-foreground">({items.length})</span>
            </p>
            <ul className="mt-1 space-y-1">
              {items.slice(0, limitPerType).map((w) => (
                <li key={w.id} className="text-xs text-muted-foreground">
                  <span className="text-foreground">{w.title}</span>
                  {[w.venue, w.year ?? w.startYear, t(`academicWorks.category.${w.category}`, { defaultValue: "" })]
                    .filter(Boolean)
                    .map((x) => ` · ${x}`)
                    .join("")}
                </li>
              ))}
              {items.length > limitPerType && (
                <li className="text-xs text-muted-foreground">
                  {t("userExpertise.more", { n: items.length - limitPerType })}
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/**
 * "Hồ sơ chuyên môn" — Phòng QLKH xem trước khi mời ai vào hội đồng (03/10): học hàm học vị, chuyên
 * ngành, lĩnh vực, số công trình theo BM02, danh sách công trình. Căn cứ: QĐ543 Điều 8.2 / 12.2 chọn
 * "chuyên gia có trình độ, kinh nghiệm trong lĩnh vực chuyên môn của đề tài".
 *
 * Quyền riêng tư: CHỈ thông tin chuyên môn. Không hiện ngày sinh, quê quán, và tuyệt đối không có tab
 * "Thông tin lập hợp đồng" (căn cước, tài khoản ngân hàng, mã số thuế) — thứ đó chỉ phục vụ lập hợp
 * đồng, không phục vụ việc chọn người.
 */
export function UserExpertiseSheet({
  userId,
  fullName,
  subtitle,
  tracks,
  open,
  onOpenChange,
}: {
  userId: string | null;
  fullName?: string;
  subtitle?: string | null;
  tracks?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={fullName ?? t("userExpertise.title")}
      description={subtitle ?? t("userExpertise.title")}
      fields={[
        {
          label: t("userExpertise.tracks"),
          value: tracks && tracks.length > 0 ? tracks.join(", ") : t("staff.noTracksDeclared"),
        },
        {
          label: t("academicProfile.title"),
          value: userId ? <AcademicProfileSummary userId={userId} hidePersonal /> : undefined,
        },
        {
          label: t("academicWorks.title"),
          value: userId ? <AcademicWorksList userId={userId} /> : undefined,
        },
        { label: t("userExpertise.privacyLabel"), value: t("userExpertise.privacyNote") },
      ]}
    />
  );
}
