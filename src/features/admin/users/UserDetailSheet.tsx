import { useTranslation } from "react-i18next";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { Badge } from "@/components/ui/badge";
import { useUserQuery } from "@/hooks/useUsers";
import { useTracksQuery } from "@/hooks/useTracks";
import { formatDateTime } from "@/utils/format";
import { AcademicProfileSummary } from "@/features/admin/users/AcademicProfileSummary";

interface UserDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailSheet({ open, onOpenChange, userId }: UserDetailSheetProps) {
  const { t } = useTranslation();
  const { data: user, isLoading } = useUserQuery(userId);
  const { data: tracks } = useTracksQuery();
  const trackNames = (user?.researchTrackIds ?? [])
    .map((id) => tracks?.find((track) => Number(track.id) === Number(id))?.name)
    .filter(Boolean);

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={user?.fullName ?? t("users.detailsTitle")}
      description={user?.email}
      isLoading={isLoading}
      fields={[
        {
          label: t("users.roles"),
          value: (
            <div className="flex flex-wrap gap-1">
              {user?.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {t(`roleName.${role}`, { defaultValue: role })}
                </Badge>
              ))}
            </div>
          ),
        },
        { label: t("users.phoneNumber"), value: user?.phoneNumber },
        { label: t("users.department"), value: user?.department },
        {
          label: t("users.academicDegree"),
          // BE trả CHUỖI tiếng Việt; trước đây đem so với MÃ SỐ trong ACADEMIC_DEGREES nên
          // không bao giờ khớp và ô này luôn hiện "-".
          value: user?.academicDegree,
        },
        {
          // `UserDto` không có trường `status` — chỉ có `isActive`. Đọc trường không tồn tại nên
          // ô Trạng thái luôn trống.
          label: t("common.status"),
          value: user ? t(user.isActive ? "users.active" : "users.locked") : undefined,
        },
        { label: t("users.lastLogin"), value: user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : undefined },
        {
          label: t("users.researchTracks"),
          value:
            trackNames.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {trackNames.map((name) => (
                  <Badge key={name} variant="outline">
                    {name}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">{t("users.noResearchTracks")}</span>
            ),
        },
        {
          label: t("academicProfile.title"),
          value: userId ? <AcademicProfileSummary userId={userId} /> : undefined,
        },
      ]}
    />
  );
}
