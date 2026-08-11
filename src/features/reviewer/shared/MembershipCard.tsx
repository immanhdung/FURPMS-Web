import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { CalendarClock, FolderKanban, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MemberRoleBadge, RoundTypeBadge } from "@/components/shared/RoleBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/utils/format";
import type { MyMembership } from "@/types/membership";

interface MembershipCardProps {
  membership: MyMembership;
  actions?: ReactNode;
  index?: number;
}

export function MembershipCard({ membership, actions, index = 0 }: MembershipCardProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <Card className="transition-shadow duration-200 hover:shadow-soft-md">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {membership.proposalTitleVI || t("common.untitledProposal")}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {membership.roundType && (
                <RoundTypeBadge type={membership.roundType} />
              )}
              <MemberRoleBadge role={membership.memberRole} />
              {membership.status && <StatusBadge status={membership.status} />}
              {membership.roundStatus && <StatusBadge status={membership.roundStatus} />}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {membership.piName && (
                <span className="inline-flex items-center gap-1">
                  <User className="size-3" /> {membership.piName}
                </span>
              )}
              {membership.trackName && (
                <span className="inline-flex items-center gap-1">
                  <FolderKanban className="size-3" /> {membership.trackName}
                </span>
              )}
              {membership.nextMeetingAt && (
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="size-3" /> {formatDateTime(membership.nextMeetingAt)}
                </span>
              )}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
