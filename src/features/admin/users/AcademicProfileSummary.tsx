import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcademicProfileQuery } from "@/hooks/useAcademicProfile";

/**
 * Lý lịch khoa học của NGƯỜI KHÁC, chỉ xem — cho Admin mở từ danh sách người dùng.
 *
 * <p>BE đã cho Admin/Staff đọc hồ sơ của người khác từ lâu (`GET /users/{id}/profile`), nhưng giao
 * diện chỉ có màn tự sửa hồ sơ của chính mình ⇒ muốn biết học hàm, chuyên ngành, số công trình của
 * một chủ nhiệm là không có chỗ xem.</p>
 */
export function AcademicProfileSummary({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useAcademicProfileQuery(userId);

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (!profile) return <p className="text-sm text-muted-foreground">{t("users.academicProfileEmpty")}</p>;

  const gender = profile.gender
    ? t(`academicProfile.${profile.gender.toLowerCase()}`, { defaultValue: profile.gender })
    : null;

  const rows: [string, string | number | null | undefined][] = [
    ["academicTitle", profile.academicTitle],
    ["scientificRank", profile.scientificRank],
    ["degreeLevel", profile.degreeLevel],
    ["specialization", profile.specialization],
    ["specializationAreas", profile.specializationAreas],
    ["institution", profile.institution],
    ["dateOfBirth", profile.dateOfBirth],
    ["gender", gender],
    ["hometown", profile.hometown],
    ["gsPgsYear", profile.gsPgsYear],
  ];
  const counts: [string, number][] = [
    ["isiScopusCount", profile.isiScopusCount],
    ["intlJournalCount", profile.intlJournalCount],
    ["domesticJournalCount", profile.domesticJournalCount],
    ["intlConferenceCount", profile.intlConferenceCount],
    ["domesticConferenceCount", profile.domesticConferenceCount],
    ["patentsCount", profile.patentsCount],
    ["phdSupervisedCount", profile.phdSupervisedCount],
    ["masterSupervisedCount", profile.masterSupervisedCount],
  ];
  const filled = rows.filter(([, v]) => v !== null && v !== undefined && v !== "");

  return (
    <div className="space-y-3">
      {filled.length > 0 ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          {filled.map(([key, v]) => (
            <div key={key} className="contents">
              <dt className="text-muted-foreground">{t(`academicProfile.${key}`)}</dt>
              <dd className="text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">{t("users.academicProfileEmpty")}</p>
      )}
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {counts.map(([key, n]) => (
          <div key={key} className="flex justify-between gap-2 rounded-md bg-muted/50 px-2 py-1">
            <dt className="text-muted-foreground">{t(`academicProfile.${key}`)}</dt>
            <dd className="font-medium tabular-nums text-foreground">{n}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
