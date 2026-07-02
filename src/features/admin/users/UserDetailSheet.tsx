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
  const { data: user, isLoading } = useUserQuery(userId);

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={user?.fullName ?? "User details"}
      description={user?.email}
      isLoading={isLoading}
      fields={[
        {
          label: "Roles",
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
        { label: "Phone number", value: user?.phoneNumber },
        { label: "Department", value: user?.department },
        {
          label: "Academic degree",
          value: ACADEMIC_DEGREES.find((d) => d.value === user?.academicDegree)?.label,
        },
        { label: "Status", value: user?.status },
        { label: "Last login", value: user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : undefined },
      ]}
    />
  );
}
