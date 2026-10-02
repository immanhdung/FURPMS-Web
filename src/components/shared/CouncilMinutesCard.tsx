import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ChevronDown, FileDown, FileSignature, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProjectMinutesQuery } from "@/hooks/useDecision";
import { decisionService } from "@/services/api/decision.service";
import { saveBlob } from "@/utils/download-blob";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { ProjectMinutes } from "@/types/decision";

/**
 * Biên bản hội đồng ĐÃ KHOÁ của một đề tài — dùng ở trang đề cương của chủ nhiệm và trang đề tài
 * của Phòng QLKH (03/10).
 *
 * <p><b>Vì sao:</b> trước đây biên bản chỉ nằm trong màn chấm của hội đồng. Chủ nhiệm không đọc
 * được kết luận lẫn kiến nghị — kể cả khi hội đồng yêu cầu hoàn thiện đề cương, tức là đúng lúc
 * họ cần biết phải sửa gì. Nút tải Word xuất đúng Biểu mẫu 04 (xét duyệt) / 12 (nghiệm thu) để in,
 * ký và lưu hồ sơ giấy.</p>
 *
 * <p>Chưa có biên bản nào khoá thì không hiện gì (với PI) — bản nháp của hội đồng chưa phải kết luận.</p>
 */
export function CouncilMinutesCard({ projectId, showEmpty = false }: { projectId: string; showEmpty?: boolean }) {
  const { t } = useTranslation();
  const { data } = useProjectMinutesQuery(projectId);

  if (!data || data.length === 0) {
    return showEmpty ? (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {t("councilMinutes.empty")}
      </p>
    ) : null;
  }

  return (
    <div className="space-y-3">
      {data.map((m) => (
        <MinutesItem key={m.id} minutes={m} />
      ))}
    </div>
  );
}

function MinutesItem({ minutes: m }: { minutes: ProjectMinutes }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isAcceptance = m.roundType === "ACCEPTANCE";
  const needsRevision = m.result === "REVISION_REQUIRED";
  const opinions = m.memberOpinions ?? [];
  const qa = m.qaEntries ?? [];

  const download = async () => {
    setDownloading(true);
    try {
      const blob = await decisionService.exportWord(m.councilId, m.projectId);
      saveBlob(blob, `${isAcceptance ? "BM12_BienBanNghiemThu" : "BM04_BienBanXetDuyet"}.docx`);
    } catch {
      toast.error(t("councilMinutes.downloadError"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section
      className={cn(
        "rounded-xl border bg-card/95 p-4 shadow-soft-xs",
        needsRevision ? "border-warning" : "border-border"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileSignature className="size-4 shrink-0 text-primary" />
            {isAcceptance ? t("councilMinutes.titleAcceptance") : t("councilMinutes.titleReview")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("councilMinutes.lockedAt", { date: formatDateTime(m.finalizedAt) })}
            {m.averageScore != null && !isAcceptance &&
              ` · ${t("councilMinutes.avgScore", { score: m.averageScore, total: m.rubricTotal ?? 100 })}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {m.result && <StatusBadge status={m.result} />}
          <Button type="button" size="sm" variant="outline" onClick={download} disabled={downloading}>
            {downloading ? <Loader2 className="animate-spin" /> : <FileDown />}
            {isAcceptance ? t("councilMinutes.downloadBm12") : t("councilMinutes.downloadBm04")}
          </Button>
        </div>
      </div>

      {needsRevision && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          {t("councilMinutes.revisionHint")}
        </p>
      )}

      <div className="mt-3 space-y-2 text-sm">
        {m.councilComments?.trim() && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("councilMinutes.conclusion")}</p>
            <p className="whitespace-pre-line text-foreground">{m.councilComments}</p>
          </div>
        )}
        {m.resultJustification?.trim() && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("councilMinutes.justification")}</p>
            <p className="whitespace-pre-line text-foreground">{m.resultJustification}</p>
          </div>
        )}
        {m.recommendations?.trim() && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("councilMinutes.recommendations")}</p>
            <p className="whitespace-pre-line text-foreground">{m.recommendations}</p>
          </div>
        )}
      </div>

      {(opinions.length > 0 || qa.length > 0) && (
        <div className="mt-3 border-t border-border pt-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            aria-expanded={open}
          >
            <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            {t("councilMinutes.memberOpinions", { n: opinions.length })}
          </button>
          {open && (
            <div className="mt-2 space-y-2">
              {opinions.map((o, i) => (
                <div key={i} className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
                  <p className="font-medium text-foreground">{o.memberName}</p>
                  {o.academicComment?.trim() && (
                    <p className="mt-0.5 whitespace-pre-line text-muted-foreground">
                      <span className="text-foreground">{t("councilMinutes.academic")}:</span> {o.academicComment}
                    </p>
                  )}
                  {o.budgetComment?.trim() && (
                    <p className="mt-0.5 whitespace-pre-line text-muted-foreground">
                      <span className="text-foreground">{t("councilMinutes.budget")}:</span> {o.budgetComment}
                    </p>
                  )}
                </div>
              ))}
              {qa.map((q, i) => (
                <div key={`qa-${i}`} className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
                  <p className="text-foreground">
                    {t("councilMinutes.question")}
                    {q.askedBy ? ` (${q.askedBy})` : ""}: {q.question}
                  </p>
                  {q.answer && (
                    <p className="mt-0.5 text-muted-foreground">
                      {t("councilMinutes.answer")}: {q.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
