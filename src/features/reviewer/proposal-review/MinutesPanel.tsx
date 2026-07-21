import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Gavel, Loader2, Lock, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useApproveMinutesMutation, useDecisionQuery, useSaveMinutesMutation } from "@/hooks/useDecision";
import { REVIEW_DECISION } from "@/constants/statuses";
import { formatDateTime } from "@/utils/format";

const RESULT_OPTIONS = [
  { value: REVIEW_DECISION.APPROVED, labelKey: "minutes.resultApproved" },
  { value: REVIEW_DECISION.REVISION_REQUIRED, labelKey: "minutes.resultRevision" },
  { value: REVIEW_DECISION.REJECTED, labelKey: "minutes.resultRejected" },
];

function isChair(role?: string | null) {
  const r = role?.trim().toLowerCase();
  return r === "chair" || r === "chairman";
}
function isSecretary(role?: string | null) {
  return role?.trim().toLowerCase() === "secretary";
}

/**
 * Biên bản họp hội đồng (BIỂU MẪU 04 / 12 của QĐ 543).
 * Luồng bắt buộc (rule #12): Thư ký soạn nháp → Chủ tịch duyệt & khóa → BE mới đổi trạng thái đề tài.
 * Điểm/phiếu chỉ hiển thị để THAM KHẢO, hệ thống không tự đếm phiếu ra kết quả.
 */
export function MinutesPanel({ councilId, memberRole }: { councilId: string; memberRole?: string | null }) {
  const { t } = useTranslation();
  const { data: decision, isLoading } = useDecisionQuery(councilId);
  const saveMutation = useSaveMinutesMutation(councilId);
  const approveMutation = useApproveMinutesMutation(councilId);

  const [result, setResult] = useState("");
  const [councilComments, setCouncilComments] = useState("");
  const [recommendations, setRecommendations] = useState("");

  // Nạp bản nháp đang có vào form (chỉ khi chưa khóa).
  useEffect(() => {
    if (decision && !decision.finalizedAt) {
      setResult(decision.result ?? "");
      setCouncilComments(decision.councilComments ?? "");
      setRecommendations(decision.recommendations ?? "");
    }
  }, [decision]);

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  const locked = Boolean(decision?.finalizedAt);
  const hasDraft = Boolean(decision && !decision.finalizedAt);
  const canDraft = isSecretary(memberRole) && !locked;
  const canApprove = isChair(memberRole) && hasDraft;

  return (
    <div className="space-y-4">
      {/* Số liệu tổng hợp — mục II.2 của BM04 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{t("minutes.meetingTally")}</p>
            {locked ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <Lock className="size-3" /> {t("minutes.locked")}
              </span>
            ) : hasDraft ? (
              <span className="text-xs font-medium text-warning">{t("minutes.draftNotApproved")}</span>
            ) : null}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t("minutes.members"), value: decision?.totalMembers },
              { label: t("minutes.attending"), value: decision?.attendingMembers },
              { label: t("minutes.validBallots"), value: decision?.validBallots },
              { label: t("minutes.averageScore"), value: decision?.averageScore },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border p-2">
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="text-sm font-semibold text-foreground">{item.value ?? "—"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("minutes.referenceOnly")}
          </p>
        </CardContent>
      </Card>

      {/* Thư ký soạn biên bản */}
      {canDraft && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t("minutes.draftTitle")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("minutes.draftHint")}
              </p>
            </div>

            <div>
              <label htmlFor="minutes-result" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("minutes.conclusion")} <span className="text-destructive">*</span>
              </label>
              <Select value={result || undefined} onValueChange={setResult}>
                <SelectTrigger id="minutes-result" className="w-full">
                  <SelectValue placeholder={t("minutes.conclusionPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {RESULT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="minutes-comments" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("minutes.councilComments")}
              </label>
              <Textarea
                id="minutes-comments"
                rows={4}
                placeholder={t("minutes.councilCommentsPlaceholder")}
                value={councilComments}
                onChange={(e) => setCouncilComments(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="minutes-recommendations" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("minutes.recommendations")}
              </label>
              <Textarea
                id="minutes-recommendations"
                rows={3}
                placeholder={t("minutes.recommendationsPlaceholder")}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={!result || saveMutation.isPending}
                onClick={() =>
                  saveMutation.mutate({
                    result,
                    councilComments: councilComments || undefined,
                    recommendations: recommendations || undefined,
                  })
                }
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                {t("minutes.saveDraft")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nội dung biên bản (read-only cho người không phải Thư ký, hoặc đã khóa) */}
      {decision && (!canDraft || locked) && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{t("minutes.minutesTitle")}</p>
              {decision.result && <StatusBadge status={decision.result} />}
            </div>
            {decision.councilComments && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("minutes.councilComments")}</p>
                <p className="mt-0.5 text-sm whitespace-pre-line text-foreground">{decision.councilComments}</p>
              </div>
            )}
            {decision.recommendations && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("minutes.recommendations")}</p>
                <p className="mt-0.5 text-sm whitespace-pre-line text-foreground">{decision.recommendations}</p>
              </div>
            )}
            {decision.finalizedAt && (
              <p className="text-xs text-muted-foreground">{t("minutes.approvedAt", { date: formatDateTime(decision.finalizedAt) })}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chủ tịch duyệt & khóa */}
      {canApprove && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t("minutes.approveAsChair")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("minutes.approveHint")}
              </p>
            </div>
            <Button
              type="button"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
            >
              {approveMutation.isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
              {t("minutes.approveAndLock")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Chưa có gì và mình không phải Thư ký */}
      {!decision && !canDraft && (
        <EmptyState
          icon={Gavel}
          title={t("minutes.noMinutes")}
          description={t("minutes.noMinutesDesc")}
        />
      )}
    </div>
  );
}
