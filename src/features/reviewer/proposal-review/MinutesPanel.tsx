import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Gavel, Loader2, Lock, MessagesSquare, Plus, Save, ShieldCheck, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MemberOpinion, QaEntry } from "@/types/decision";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useApproveMinutesMutation, useDecisionQuery, useSaveMinutesMutation } from "@/hooks/useDecision";
import { useCouncilMembersQuery } from "@/hooks/useCouncilMembers";
import { useAllScoresQuery } from "@/hooks/useReviewScoring";
import { useFeedbackListQuery } from "@/hooks/useFeedback";
import { REVIEW_DECISION } from "@/constants/statuses";
import { formatDateTime } from "@/utils/format";
import type { ApiError } from "@/types/common";

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

  const { data: members } = useCouncilMembersQuery(councilId);
  const { data: scores, error: scoresError } = useAllScoresQuery(councilId);
  const { data: feedbackList, error: feedbackError } = useFeedbackListQuery(councilId);
  const isScoresForbidden = (scoresError as ApiError | null)?.status === 403;
  const isFeedbackForbidden = (feedbackError as ApiError | null)?.status === 403;
  const membersById = new Map((members ?? []).map((m) => [m.userId, m]));

  const [result, setResult] = useState("");
  const [councilComments, setCouncilComments] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [qaEntries, setQaEntries] = useState<QaEntry[]>([]);
  const [minutesStyle, setMinutesStyle] = useState<"QA" | "FREEFORM">("FREEFORM");
  const [opinions, setOpinions] = useState<MemberOpinion[]>([]);
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);

  // Nạp bản nháp đang có vào form (chỉ khi chưa khóa). Set state trong lúc render (thay vì
  // trong effect) là cách React khuyến nghị để đồng bộ từ dữ liệu vừa tải xong.
  if (decision && !decision.finalizedAt && decision.id !== loadedDraftId) {
    setLoadedDraftId(decision.id);
    setResult(decision.result ?? "");
    setCouncilComments(decision.councilComments ?? "");
    setRecommendations(decision.recommendations ?? "");
    const qa = decision.qaEntries ?? [];
    setQaEntries(qa);
    setMinutesStyle(qa.length > 0 ? "QA" : "FREEFORM"); // mở đúng phong cách đã soạn trước đó
    setOpinions(decision.memberOpinions ?? []);
  }

  const addQa = () => setQaEntries((prev) => [...prev, { askedBy: "", question: "", answer: "", order: prev.length }]);
  const updateQa = (i: number, patch: Partial<QaEntry>) =>
    setQaEntries((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const removeQa = (i: number) => setQaEntries((prev) => prev.filter((_, idx) => idx !== i));

  const addOpinion = (memberName = "") =>
    setOpinions((prev) => [...prev, { memberName, academicComment: "", budgetComment: "", order: prev.length }]);
  const updateOpinion = (i: number, patch: Partial<MemberOpinion>) =>
    setOpinions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const removeOpinion = (i: number) => setOpinions((prev) => prev.filter((_, idx) => idx !== i));
  // Prefill 1 dòng / thành viên hội đồng (BM04 II.1) để Thư ký khỏi gõ tên.
  const fillOpinionsFromRoster = () =>
    setOpinions(
      (members ?? []).map((m, i) => ({ memberName: m.reviewerName ?? "—", academicComment: "", budgetComment: "", order: i }))
    );

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  const locked = Boolean(decision?.finalizedAt);
  const hasDraft = Boolean(decision && !decision.finalizedAt);
  const canDraft = isSecretary(memberRole) && !locked;
  const canApprove = isChair(memberRole) && hasDraft;

  const dutyLabel = (role?: string | null) => {
    const key = role?.trim();
    const known = key ? t(`reviewBoard.role.${key}`, { defaultValue: "" }) : "";
    return known || key || "—";
  };
  const memberStatusLabel = (m: { status?: string | null; confirmedAt?: string | null; declinedAt?: string | null }) => {
    if (m.declinedAt || m.status?.toUpperCase() === "DECLINED") return t("minutes.mDeclined");
    if (m.confirmedAt || m.status?.toUpperCase() === "CONFIRMED") return t("minutes.mConfirmed");
    if (m.status?.toUpperCase() === "INVITED") return t("minutes.mInvited");
    return t("minutes.mPending");
  };
  const totalMembers = decision?.totalMembers ?? members?.length ?? 0;
  const attending = decision?.attendingMembers ?? null;

  return (
    <div className="space-y-4">
      {/* Thông tin chung — Danh sách hội đồng (BM04 mục I.6), auto lấy từ hội đồng */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-foreground">{t("minutes.rosterTitle")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("minutes.rosterAutoNote")}</p>
          {members && members.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-1.5 pr-3 font-medium">{t("minutes.mName")}</th>
                    <th className="pb-1.5 pr-3 font-medium">{t("minutes.mDuty")}</th>
                    <th className="pb-1.5 font-medium">{t("minutes.mStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5 pr-3 text-foreground">{m.reviewerName ?? "—"}</td>
                      <td className="py-1.5 pr-3 text-muted-foreground">{dutyLabel(m.memberRole)}</td>
                      <td className="py-1.5 text-muted-foreground">{memberStatusLabel(m)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{t("minutes.noMembers")}</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {t("minutes.total")}: <span className="font-medium text-foreground">{totalMembers}</span>
            {attending != null && (
              <>
                {" · "}
                {t("minutes.attending")}: <span className="font-medium text-foreground">{attending}</span>
                {" · "}
                {t("minutes.absent")}: <span className="font-medium text-foreground">{Math.max(totalMembers - attending, 0)}</span>
              </>
            )}
          </p>
        </CardContent>
      </Card>

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

      {/* Điểm và nhận xét của từng thành viên — tham khảo, đặc biệt cho Thư ký soạn biên bản */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">{t("minutes.scoresTitle")}</p>
            {isScoresForbidden ? (
              <p className="mt-1 text-sm text-warning">{t("minutes.scoresForbidden")}</p>
            ) : scores && scores.length > 0 ? (
              <ul className="mt-1.5 space-y-1.5">
                {scores.map((score) => {
                  const total = score.scoreDetails?.reduce((sum, d) => sum + (d.givenScore || 0), 0) ?? 0;
                  const reviewer = score.reviewerId ? membersById.get(score.reviewerId) : undefined;
                  return (
                    <li key={score.id} className="text-sm text-foreground">
                      <span className="font-medium">{reviewer?.reviewerName ?? score.reviewerId ?? "—"}</span>: {total.toFixed(1)}
                      {score.generalComments && <span className="text-muted-foreground"> — {score.generalComments}</span>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{t("minutes.noScores")}</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">{t("minutes.feedbackTitle")}</p>
            {isFeedbackForbidden ? (
              <p className="mt-1 text-sm text-warning">{t("minutes.feedbackForbidden")}</p>
            ) : feedbackList && feedbackList.length > 0 ? (
              <ul className="mt-1.5 space-y-1.5">
                {feedbackList.map((feedback) => {
                  const reviewer = feedback.reviewerId ? membersById.get(feedback.reviewerId) : undefined;
                  return (
                    <li key={feedback.id} className="text-sm text-foreground">
                      <span className="font-medium">{reviewer?.reviewerName ?? feedback.reviewerId ?? "—"}</span>:{" "}
                      {feedback.overallAssessment ?? feedback.otherComments ?? "—"}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{t("minutes.noFeedback")}</p>
            )}
          </div>
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

            {/* BM04 II.1 — Thư ký chọn phong cách: Hỏi–Đáp (Q&A) hoặc viết tự do */}
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">{t("minutes.styleLabel")}</p>
              <div className="inline-flex rounded-lg border border-border p-0.5">
                {([
                  { key: "QA", icon: MessagesSquare, label: t("minutes.styleQa") },
                  { key: "FREEFORM", icon: FileText, label: t("minutes.styleFree") },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setMinutesStyle(opt.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      minutesStyle === opt.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <opt.icon className="size-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {minutesStyle === "QA" ? (
              <div className="space-y-2">
                {qaEntries.length === 0 && (
                  <p className="text-xs text-muted-foreground">{t("minutes.qaEmpty")}</p>
                )}
                {qaEntries.map((qa, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={t("minutes.qaAskedBy")}
                        value={qa.askedBy ?? ""}
                        onChange={(e) => updateQa(i, { askedBy: e.target.value })}
                        className="h-8"
                      />
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={t("common.remove")} onClick={() => removeQa(i)}>
                        <Trash2 />
                      </Button>
                    </div>
                    <Textarea
                      rows={2}
                      placeholder={t("minutes.qaQuestion")}
                      value={qa.question}
                      onChange={(e) => updateQa(i, { question: e.target.value })}
                    />
                    <Textarea
                      rows={2}
                      placeholder={t("minutes.qaAnswer")}
                      value={qa.answer ?? ""}
                      onChange={(e) => updateQa(i, { answer: e.target.value })}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addQa}>
                  <Plus /> {t("minutes.qaAdd")}
                </Button>
              </div>
            ) : (
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
            )}

            {/* BM04 II.1 — Ý kiến từng thành viên (chuyên môn / kinh phí) */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{t("minutes.opinionsTitle")}</p>
                {opinions.length === 0 && (members?.length ?? 0) > 0 && (
                  <Button type="button" variant="outline" size="sm" onClick={fillOpinionsFromRoster}>
                    <Users className="size-3.5" /> {t("minutes.opinionsFill")}
                  </Button>
                )}
              </div>
              {opinions.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("minutes.opinionsEmpty")}</p>
              ) : (
                <div className="space-y-2">
                  {opinions.map((o, i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={t("minutes.opMember")}
                          value={o.memberName}
                          onChange={(e) => updateOpinion(i, { memberName: e.target.value })}
                          className="h-8 font-medium"
                        />
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("common.remove")} onClick={() => removeOpinion(i)}>
                          <Trash2 />
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Textarea
                          rows={2}
                          placeholder={t("minutes.opAcademic")}
                          value={o.academicComment ?? ""}
                          onChange={(e) => updateOpinion(i, { academicComment: e.target.value })}
                        />
                        <Textarea
                          rows={2}
                          placeholder={t("minutes.opBudget")}
                          value={o.budgetComment ?? ""}
                          onChange={(e) => updateOpinion(i, { budgetComment: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addOpinion()}>
                    <Plus /> {t("minutes.opAdd")}
                  </Button>
                </div>
              )}
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
                    qaEntries: qaEntries
                      .filter((q) => q.question.trim())
                      .map((q, i) => ({
                        askedBy: q.askedBy || undefined,
                        question: q.question,
                        answer: q.answer || undefined,
                        order: i,
                      })),
                    memberOpinions: opinions
                      .filter((o) => o.memberName.trim())
                      .map((o, i) => ({
                        memberName: o.memberName,
                        academicComment: o.academicComment || undefined,
                        budgetComment: o.budgetComment || undefined,
                        order: i,
                      })),
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
            {decision.memberOpinions && decision.memberOpinions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("minutes.opinionsTitle")}</p>
                <div className="mt-1 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="pb-1.5 pr-3 font-medium">{t("minutes.opMember")}</th>
                        <th className="pb-1.5 pr-3 font-medium">{t("minutes.opAcademic")}</th>
                        <th className="pb-1.5 font-medium">{t("minutes.opBudget")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decision.memberOpinions.map((o, i) => (
                        <tr key={i} className="border-b border-border/50 align-top last:border-0">
                          <td className="py-1.5 pr-3 font-medium text-foreground">{o.memberName}</td>
                          <td className="py-1.5 pr-3 whitespace-pre-line text-foreground">{o.academicComment || "—"}</td>
                          <td className="py-1.5 whitespace-pre-line text-foreground">{o.budgetComment || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {decision.qaEntries && decision.qaEntries.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("minutes.qaTitle")}</p>
                <ul className="mt-1 space-y-2">
                  {decision.qaEntries.map((qa, i) => (
                    <li key={i} className="rounded-lg border border-border/60 p-2.5">
                      <p className="text-sm text-foreground">
                        <span className="font-medium text-primary">{t("minutes.qaQ")}</span>
                        {qa.askedBy ? ` (${qa.askedBy})` : ""}: {qa.question}
                      </p>
                      {qa.answer && (
                        <p className="mt-1 text-sm text-foreground">
                          <span className="font-medium text-success">{t("minutes.qaA")}</span>: {qa.answer}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
