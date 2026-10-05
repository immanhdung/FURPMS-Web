import { useTranslation } from "react-i18next";
import { FileSearch, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckConsistencyMutation } from "@/hooks/useProposalAi";

/** MISSING/MISMATCH là sai sót thật (đỏ); EXTRA chỉ là thông tin thêm (xám). */
const KIND_VARIANT: Record<string, "destructive" | "secondary"> = {
  MISSING: "destructive",
  MISMATCH: "destructive",
  EXTRA: "secondary",
};

/**
 * Đối chiếu thông tin PI đã điền với FILE đề cương họ nộp.
 *
 * Đây là thứ thầy yêu cầu (29/07): *"cho AI coi lại mấy cái PI điền vô và so với
 * proposal của họ xem có sai sót gì cần chỉnh sửa"* — khác với "Góp ý AI" (chỉ đọc
 * field đã điền rồi nhận xét chung, không mở file).
 */
export function AiConsistencyCard({ proposalId }: { proposalId: string }) {
  const { t } = useTranslation();
  const checkMutation = useCheckConsistencyMutation();
  const result = checkMutation.data;

  return (
    <Card variant="glass" className="border-primary/15">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-linear-to-br from-primary to-brand-secondary text-white">
              <FileSearch className="size-3.5" />
            </div>
            <CardTitle className="text-sm">{t("proposal.aiConsistency")}</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkMutation.mutate(proposalId)}
            disabled={checkMutation.isPending}
          >
            {checkMutation.isPending ? <Loader2 className="animate-spin" /> : <FileSearch />}
            {result ? t("proposal.aiConsistencyAgain") : t("proposal.aiConsistencyRun")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {checkMutation.isPending && <div className="h-16 animate-pulse rounded-lg bg-muted" />}

        {!checkMutation.isPending && !result && (
          <p className="text-xs text-muted-foreground">{t("proposal.aiConsistencyDesc")}</p>
        )}

        {result && !result.hasFile && (
          <p className="text-xs text-warning">{t("proposal.aiConsistencyNoFile")}</p>
        )}

        {result?.hasFile && result.issues.length === 0 && (
          <p className="flex items-center gap-1.5 text-xs text-success">
            <ShieldCheck className="size-3.5" />
            {t("proposal.aiConsistencyClean", { file: result.fileName })}
          </p>
        )}

        {result?.hasFile && result.issues.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-muted-foreground">
              {t("proposal.aiConsistencyAgainst", { file: result.fileName })}
            </p>
            <ul className="space-y-2">
              {result.issues.map((issue, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.05 }}
                  className="rounded-lg bg-primary/4 p-2.5"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant={KIND_VARIANT[issue.kind] ?? "secondary"}>
                      {t(`proposal.aiConsistencyKind.${issue.kind}`, { defaultValue: issue.kind })}
                    </Badge>
                    <span className="text-xs font-medium text-foreground">{issue.field}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{issue.detail}</p>
                </motion.li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground">{t("proposal.aiConsistencyHint")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
