import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSummarizeProposalMutation } from "@/hooks/useProposalAi";

export function AiSummaryCard({ proposalId }: { proposalId: string }) {
  const { t } = useTranslation();
  const summarizeMutation = useSummarizeProposalMutation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle className="text-sm">{t("proposal.aiSummary")}</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => summarizeMutation.mutate(proposalId)}
            disabled={summarizeMutation.isPending}
          >
            {summarizeMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {summarizeMutation.data ? t("proposal.regenerate") : t("proposal.generate")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!summarizeMutation.data && !summarizeMutation.isPending && (
          <p className="text-xs text-muted-foreground">{t("proposal.aiSummaryDesc")}</p>
        )}
        {summarizeMutation.isPending && <div className="h-16 animate-pulse rounded-lg bg-muted" />}
        {summarizeMutation.data && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
            <p className="text-sm text-foreground">{summarizeMutation.data.summary}</p>
            <ul className="space-y-1.5">
              {summarizeMutation.data.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  {highlight}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
