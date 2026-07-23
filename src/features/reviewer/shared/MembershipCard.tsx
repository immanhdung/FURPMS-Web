import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {membership.proposalTitleVI || t("common.untitledProposal")}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {membership.roundType && <Badge variant="secondary">{membership.roundType}</Badge>}
              {membership.memberRole && <Badge variant="outline">{membership.memberRole}</Badge>}
              {membership.status && <StatusBadge status={membership.status} />}
              {membership.roundStatus && <StatusBadge status={membership.roundStatus} />}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
