import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMyScoreQuery, useRubricTemplatesQuery, useSubmitScoreMutation } from "@/hooks/useReviewScoring";
import { ROUTES } from "@/constants/routes";
import type { ScoreDetailPayload } from "@/types/review-scoring";

interface RubricScoringFormProps {
  councilId: string;
  roundType: string;
}

export function RubricScoringForm({ councilId, roundType }: RubricScoringFormProps) {
  const navigate = useNavigate();
  const { data: templates, isLoading: isTemplatesLoading } = useRubricTemplatesQuery();
  const { data: existingScore, isLoading: isScoreLoading } = useMyScoreQuery(councilId);
  const submitMutation = useSubmitScoreMutation(councilId);

  /**
   * Confirmed live: `templateType` (not `roundType`, which doesn't exist on this response) uses
   * this app's exact casing ("REVIEW", "PROGRESS_CHECK") — no name conversion needed. The list
   * endpoint already returns each template's full `criteria` array, which is the sole source of
   * truth for what the backend requires — don't cross-reference the standalone /rubric-criteria
   * list or fall back to "all active criteria"; both produced wrong submissions in live testing.
   */
  const matchingTemplate = templates?.find((t) => t.templateType?.toUpperCase() === roundType?.toUpperCase());
  const activeCriteria = useMemo(() => matchingTemplate?.criteria ?? [], [matchingTemplate]);

  const [scores, setScores] = useState<Record<number, { givenScore: number; comments: string }>>({});
  const [generalComments, setGeneralComments] = useState("");
  const [otherRecommendations, setOtherRecommendations] = useState("");
  const [seededFor, setSeededFor] = useState<string | null>(null);

  const isLoading = isTemplatesLoading || isScoreLoading;
  const isReady = !isLoading && activeCriteria.length > 0;
  const seedKey = isReady ? `${existingScore?.id ?? "none"}:${activeCriteria.length}` : null;

  if (seedKey !== null && seedKey !== seededFor) {
    setSeededFor(seedKey);
    const initial: Record<number, { givenScore: number; comments: string }> = {};
    for (const criterion of activeCriteria) {
      const existing = existingScore?.scoreDetails?.find((d) => d.criterionId === criterion.id);
      initial[criterion.id] = { givenScore: existing?.givenScore ?? 0, comments: existing?.comments ?? "" };
    }
    setScores(initial);
    setGeneralComments(existingScore?.generalComments ?? "");
    setOtherRecommendations(existingScore?.otherRecommendations ?? "");
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (activeCriteria.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No rubric criteria configured"
        description="No rubric template is configured for this round type. Contact an administrator."
      />
    );
  }

  const totalScore = Object.values(scores).reduce((sum, s) => sum + (s.givenScore || 0), 0);
  const maxTotal = activeCriteria.reduce((sum, c) => sum + c.maxScore, 0);

  const handleSubmit = () => {
    if (!matchingTemplate) {
      toast.error("No rubric template is available for this round.");
      return;
    }
    const scoreDetails: ScoreDetailPayload[] = activeCriteria.map((criterion) => ({
      criterionId: criterion.id,
      givenScore: scores[criterion.id]?.givenScore ?? 0,
      comments: scores[criterion.id]?.comments || undefined,
    }));
    submitMutation.mutate(
      {
        templateId: matchingTemplate.id,
        generalComments: generalComments || undefined,
        otherRecommendations: otherRecommendations || undefined,
        scoreDetails,
      },
      { onSuccess: () => navigate(ROUTES.ASSIGNED_REVIEWS) }
    );
  };

  const totalPercent = maxTotal > 0 ? Math.min(100, (totalScore / maxTotal) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-linear-to-br from-primary/5 to-brand-secondary/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Total score</p>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            {totalScore.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ {maxTotal}</span>
          </p>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-brand-secondary transition-[width] duration-300"
            style={{ width: `${totalPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {activeCriteria.map((criterion, index) => {
          const given = scores[criterion.id]?.givenScore ?? 0;
          const percent = criterion.maxScore > 0 ? Math.min(100, (given / criterion.maxScore) * 100) : 0;
          return (
            <Card key={criterion.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-foreground">{criterion.criterionName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={criterion.maxScore}
                      step="0.5"
                      className="w-20 text-right font-medium"
                      value={scores[criterion.id]?.givenScore ?? 0}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [criterion.id]: { ...prev[criterion.id], givenScore: Number(e.target.value) },
                        }))
                      }
                    />
                    <span className="text-xs text-muted-foreground">/ {criterion.maxScore}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <Textarea
                  placeholder="Comments (optional)"
                  rows={2}
                  value={scores[criterion.id]?.comments ?? ""}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [criterion.id]: { ...prev[criterion.id], comments: e.target.value },
                    }))
                  }
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-soft-xs">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">General comments</label>
          <Textarea rows={3} value={generalComments} onChange={(e) => setGeneralComments(e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Other recommendations</label>
          <Textarea rows={3} value={otherRecommendations} onChange={(e) => setOtherRecommendations(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
          {submitMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {existingScore ? "Update score" : "Submit score"}
        </Button>
      </div>
    </div>
  );
}
