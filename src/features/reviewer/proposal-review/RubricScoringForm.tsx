import { useMemo, useState } from "react";
import { ClipboardList, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRubricCriteriaQuery } from "@/hooks/useRubricCriteria";
import { useMyScoreQuery, useRubricTemplatesQuery, useSubmitScoreMutation } from "@/hooks/useReviewScoring";
import { toRubricRoundTypeName } from "@/constants/statuses";
import type { ScoreDetailPayload } from "@/types/review-scoring";

interface RubricScoringFormProps {
  councilId: string;
  roundType: string;
}

export function RubricScoringForm({ councilId, roundType }: RubricScoringFormProps) {
  const { data: criteria, isLoading: isCriteriaLoading } = useRubricCriteriaQuery(toRubricRoundTypeName(roundType));
  const { data: templates } = useRubricTemplatesQuery();
  const { data: existingScore, isLoading: isScoreLoading } = useMyScoreQuery(councilId);
  const submitMutation = useSubmitScoreMutation(councilId);

  const matchingTemplate = templates?.find((t) => t.roundType === roundType) ?? templates?.[0];

  const activeCriteria = useMemo(() => (criteria ?? []).filter((c) => c.isActive), [criteria]);

  const [scores, setScores] = useState<Record<number, { givenScore: number; comments: string }>>({});
  const [generalComments, setGeneralComments] = useState("");
  const [otherRecommendations, setOtherRecommendations] = useState("");
  const [seededFor, setSeededFor] = useState<string | null>(null);

  const isReady = !isCriteriaLoading && !isScoreLoading && activeCriteria.length > 0;
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

  if (isCriteriaLoading || isScoreLoading) {
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
        description={`No active criteria found for ${roundType} rounds. Contact an administrator.`}
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
    submitMutation.mutate({
      templateId: matchingTemplate.id,
      generalComments: generalComments || undefined,
      otherRecommendations: otherRecommendations || undefined,
      scoreDetails,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
        <p className="text-sm font-medium text-foreground">Total score</p>
        <p className="text-sm font-semibold text-foreground">
          {totalScore.toFixed(1)} / {maxTotal}
        </p>
      </div>

      <div className="space-y-3">
        {activeCriteria.map((criterion) => (
          <Card key={criterion.id}>
            <CardContent className="space-y-2.5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{criterion.name}</p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={criterion.maxScore}
                    step="0.5"
                    className="w-20"
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
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">General comments</label>
        <Textarea rows={3} value={generalComments} onChange={(e) => setGeneralComments(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Other recommendations</label>
        <Textarea rows={3} value={otherRecommendations} onChange={(e) => setOtherRecommendations(e.target.value)} />
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
