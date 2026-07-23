import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface QuickAction {
  /** Khóa i18n cho nhãn (vd "dashboard.actions.submitProposal"). */
  labelKey: string;
  path: string;
  icon: LucideIcon;
}

export function QuickActions({ actions, title }: { actions: QuickAction[]; title?: string }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title ?? t("dashboard.quickActions")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2.5">
        {actions.map((action, index) => (
          <motion.div
            key={action.path}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
          >
            <Link
              to={action.path}
              className="group flex flex-col items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-primary/3"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <action.icon className="size-4" />
              </div>
              <span className="text-xs font-medium text-foreground">{t(action.labelKey)}</span>
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
