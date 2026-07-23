import { useTranslation } from "react-i18next";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { Badge } from "@/components/ui/badge";
import { useUserQuery } from "@/hooks/useUsers";
import { ACADEMIC_DEGREES } from "@/types/user";
import { formatDateTime } from "@/utils/format";

interface UserDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailSheet({ open, onOpenChange, userId }: UserDetailSheetProps) {
  const { t } = useTranslation();
  const { data: user, isLoading } = useUserQuery(userId);

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
                  {role}
                </Badge>
              ))}
            </div>
          ),
        },
        { label: t("users.phoneNumber"), value: user?.phoneNumber },
        { label: t("users.department"), value: user?.department },
        {
          label: t("users.academicDegree"),
          value: ACADEMIC_DEGREES.find((d) => d.value === user?.academicDegree)?.label,
        },
        { label: t("common.status"), value: user?.status },
        { label: t("users.lastLogin"), value: user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : undefined },
      ]}
    />
  );
}
