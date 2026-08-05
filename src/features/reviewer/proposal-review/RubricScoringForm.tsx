import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMyScoreQuery, useSubmitScoreMutation } from "@/hooks/useReviewScoring";
import { useRubricForCouncilQuery } from "@/hooks/useRubricTemplates";
import { useSuggestScoresMutation } from "@/hooks/useProposalAi";
import type { ScoreDetailPayload } from "@/types/review-scoring";

interface RubricScoringFormProps {
  councilId: string;
  /** Để AI đọc nội dung đề cương khi gợi ý điểm. Không có thì ẩn nút AI. */
  proposalId?: string | null;
  // roundType đã bỏ: BE tự suy loại vòng từ councilId khi trả bộ tiêu chí.
}

export function RubricScoringForm({ councilId, proposalId }: RubricScoringFormProps) {
  const { t } = useTranslation();
  // Lấy ĐÚNG bộ tiêu chí cho hội đồng này: BE tự suy (đợt + lĩnh vực + loại vòng) từ councilId
  // rồi trả bộ đã gắn cho lĩnh vực đó; chưa gắn thì trả bộ mặc định (không bao giờ kẹt).
  const { data: resolvedTemplate, isLoading: isTemplatesLoading } = useRubricForCouncilQuery(councilId);
  const { data: existingScore, isLoading: isScoreLoading } = useMyScoreQuery(councilId);
  const submitMutation = useSubmitScoreMutation(councilId);

  /**
   * `criteria` trong bộ trả về là NGUỒN DUY NHẤT cho những gì BE yêu cầu — đừng đối chiếu với
   * danh sách /rubric-criteria hay fallback "mọi tiêu chí đang bật"; cả hai từng gây nộp sai.
   */
  const matchingTemplate = resolvedTemplate ?? null;
  const activeCriteria = useMemo(() => matchingTemplate?.criteria ?? [], [matchingTemplate]);

  const [scores, setScores] = useState<Record<number, { givenScore: number; comments: string }>>({});
  const [generalComments, setGeneralComments] = useState("");
  const [otherRecommendations, setOtherRecommendations] = useState("");
  const [seededFor, setSeededFor] = useState<string | null>(null);

  // AI chỉ GỢI Ý: hiện dưới từng tiêu chí kèm nút "Áp dụng", KHÔNG tự ghi đè điểm
  // người chấm đã nhập (rule #12 — quyết định là của con người).
  const suggestMutation = useSuggestScoresMutation(councilId);
  const suggestionById = useMemo(
    () => new Map((suggestMutation.data ?? []).map((s) => [s.criterionId, s])),
    [suggestMutation.data],
  );

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
        title={t("review.noRubric")}
        description={t("review.noRubricDesc")}
      />
    );
  }

  const totalScore = Object.values(scores).reduce((sum, s) => sum + (s.givenScore || 0), 0);
  const maxTotal = activeCriteria.reduce((sum, c) => sum + c.maxScore, 0);

  const handleSubmit = () => {
    if (!matchingTemplate) {
      toast.error(t("review.noRubricRound"));
      return;
    }
    // Validate rõ criterion nào vượt thang điểm — trước đây để BE trả 400 chung, reviewer phải tự mò.
    const invalid = activeCriteria.find((c) => {
      const v = scores[c.id]?.givenScore ?? 0;
      return v < 0 || v > c.maxScore;
    });
    if (invalid) {
      toast.error(t("review.scoreRange", { name: invalid.criterionName, max: invalid.maxScore }));
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
      // KHÔNG rời trang sau khi nộp: người chấm hay muốn xem lại/sửa điểm ngay,
      // bị đá về danh sách rồi phải mò vào lại là khó chịu.
    );
  };

  const scorePct = maxTotal > 0 ? Math.min(100, (totalScore / maxTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl border border-primary/15 bg-linear-to-r from-primary/8 to-brand-secondary/8 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{t("review.totalScore")}</p>
          <p className="text-base font-semibold text-foreground">
            {totalScore.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ {maxTotal}</span>
          </p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-brand-secondary transition-all duration-300"
            style={{ width: `${scorePct}%` }}
          />
        </div>
      </div>

      {proposalId && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/15 bg-primary/4 px-3 py-2">
          <p className="text-xs text-muted-foreground">{t("review.aiSuggestHint")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={suggestMutation.isPending}
            onClick={() => suggestMutation.mutate(proposalId)}
          >
            {suggestMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {suggestMutation.data ? t("review.aiSuggestAgain") : t("review.aiSuggest")}
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {activeCriteria.map((criterion, index) => (
          <Card key={criterion.id}>
            <CardContent className="space-y-2.5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  {criterion.criterionName}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={criterion.maxScore}
                    step="0.5"
                    className="w-20"
                    // Hiện rỗng khi 0 (thay vì "0" dính đầu gây "05" khó chịu khi gõ tay); rỗng = 0 lúc nộp.
                    value={scores[criterion.id]?.givenScore || ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [criterion.id]: {
                          ...prev[criterion.id],
                          givenScore: e.target.value === "" ? 0 : Number(e.target.value),
                        },
                      }))
                    }
                  />
                  <span className="text-xs text-muted-foreground">/ {criterion.maxScore}</span>
                </div>
              </div>
              <Textarea
                placeholder={t("review.commentsOptional")}
                rows={2}
                value={scores[criterion.id]?.comments ?? ""}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [criterion.id]: { ...prev[criterion.id], comments: e.target.value },
                  }))
                }
              />

              {suggestionById.get(criterion.id) && (
                <div className="flex flex-wrap items-start gap-2 rounded-md bg-primary/4 px-2.5 py-2 text-xs">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {t("review.aiSuggestedScore", {
                        score: suggestionById.get(criterion.id)!.suggestedScore,
                        max: criterion.maxScore,
                      })}
                    </p>
                    <p className="text-muted-foreground">{suggestionById.get(criterion.id)!.comment}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 shrink-0 px-2 text-xs"
                    onClick={() => {
                      const s = suggestionById.get(criterion.id)!;
                      setScores((prev) => ({
                        ...prev,
                        [criterion.id]: {
                          givenScore: s.suggestedScore,
                          comments: prev[criterion.id]?.comments || s.comment,
                        },
                      }));
                    }}
                  >
                    {t("review.aiApply")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("review.generalComments")}</label>
        <Textarea rows={3} value={generalComments} onChange={(e) => setGeneralComments(e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("review.otherRecommendations")}</label>
        <Textarea rows={3} value={otherRecommendations} onChange={(e) => setOtherRecommendations(e.target.value)} />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
          {submitMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {existingScore ? t("review.updateScore") : t("review.submitScore")}
        </Button>
      </div>
    </div>
  );
}
