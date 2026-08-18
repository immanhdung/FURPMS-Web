import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, FileText, Paperclip } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { openFileInNewTab } from "@/services/api/fileDownload";
import { externalUrl, formatDateTime } from "@/utils/format";

/**
 * Panel xem CHI TIẾT một sản phẩm bàn giao / một kỳ báo cáo tiến độ.
 *
 * <p>
 * Trước 17/08 cả Staff lẫn thành viên hội đồng chỉ thấy **tên + ngày nộp + trạng thái**. Mọi thứ
 * chủ nhiệm thực sự gõ vào — yêu cầu khoa học, mô tả sản phẩm, nội dung đã làm / còn tồn, kế hoạch
 * kỳ sau, kiến nghị — đều đã nằm trong phản hồi của máy chủ nhưng **không màn nào bày ra**. Người
 * chấm nghiệm thu vì thế không có căn cứ nào ngoài buổi họp, còn Staff duyệt báo cáo tiến độ thì
 * duyệt gần như bằng niềm tin.
 * </p>
 * <p>
 * Dùng CHUNG cho hai vai: thành viên hội đồng (tab "Hồ sơ nghiệm thu") và Staff (chi tiết hợp
 * đồng). Chỉ để XEM — nút duyệt vẫn ở chỗ cũ, panel này không đổi trạng thái gì.
 * </p>
 */

/** Một file mở được. Khớp với `DossierFileDto` của máy chủ. */
export interface DossierFile {
  id: string;
  fileName: string;
  category?: string | null;
  sizeBytes?: number;
  uploadedAt?: string;
  downloadUrl: string;
}

function formatSize(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Một mục thông tin — tự ẩn khi rỗng, để panel không đầy nhãn trống. */
function Field({ label, value }: { label: string; value?: ReactNode }) {
  const empty =
    value === null || value === undefined || (typeof value === "string" && value.trim() === "");
  if (empty) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-line text-sm text-foreground">{value}</p>
    </div>
  );
}

/**
 * Link do chủ nhiệm dán (kho mã nguồn, bài báo đã đăng, thư mục minh chứng).
 * Đi qua `externalUrl` vì người dùng hay gõ thiếu `https://` — thiếu thì trình duyệt hiểu là
 * đường dẫn tương đối và nhảy lạc trong chính ứng dụng.
 */
function LinkRow({ label, url }: { label: string; url?: string | null }) {
  const href = externalUrl(url);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
    >
      <ExternalLink className="size-3.5 shrink-0" />
      {label}
    </a>
  );
}

function FileList({ title, files }: { title: string; files?: DossierFile[] | null }) {
  if (!files || files.length === 0) return null;
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Paperclip className="size-3.5" />
        {title}
      </p>
      <ul className="space-y-1">
        {files.map((f) => {
          const size = formatSize(f.sizeBytes);
          return (
            <li key={f.id}>
              {/* Nút chứ KHÔNG phải <a href>: endpoint tải file có [Authorize] mà token nằm ở
                  localStorage, thẻ <a> không gửi header nên luôn ăn 401 — đúng lỗi "bấm vào cũng
                  không xem được" (18/08). Chi tiết ở `services/api/fileDownload.ts`. */}
              <button
                type="button"
                onClick={() => void openFileInNewTab(f.downloadUrl)}
                className="flex items-start gap-1.5 text-left text-sm text-primary hover:underline"
              >
                <FileText className="mt-0.5 size-3.5 shrink-0" />
                <span className="break-all">
                  {f.fileName}
                  {size && <span className="ml-1 text-xs text-muted-foreground">({size})</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Sản phẩm bàn giao. Trường nào cũng để tuỳ chọn để dùng được với cả DTO hồ sơ lẫn DTO Staff. */
export interface DeliverableDetail {
  productName: string;
  description?: string | null;
  scientificRequirements?: string | null;
  acceptanceStatus?: string | null;
  qualityAssessment?: string | null;
  dueDate?: string | null;
  submittedAt?: string | null;
  fileUrl?: string | null;
  trialEvidenceUrl?: string | null;
  files?: DossierFile[] | null;
}

export function DeliverableDetailSheet({
  item,
  open,
  onOpenChange,
}: {
  item: DeliverableDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="pr-6">{item.productName}</SheetTitle>
          <SheetDescription>{t("dossierDetail.deliverableDesc")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          {item.acceptanceStatus && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{t("dossierDetail.status")}</p>
              <StatusBadge status={item.acceptanceStatus} />
            </div>
          )}

          <Field label={t("dossierDetail.scientificRequirements")} value={item.scientificRequirements} />
          <Field label={t("dossierDetail.description")} value={item.description} />
          <Field label={t("dossierDetail.dueDate")} value={item.dueDate} />
          <Field
            label={t("dossierDetail.submittedAt")}
            value={item.submittedAt ? formatDateTime(item.submittedAt) : null}
          />
          <Field label={t("dossierDetail.qualityAssessment")} value={item.qualityAssessment} />

          <div className="space-y-1.5">
            <LinkRow label={t("dossierDetail.productLink")} url={item.fileUrl} />
            <LinkRow label={t("dossierDetail.trialEvidenceLink")} url={item.trialEvidenceUrl} />
          </div>

          <FileList title={t("dossierDetail.attachments")} files={item.files} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Một hoạt động trong bảng tiến độ (BM06). */
export interface ProgressReportItemDetail {
  id: number;
  activityName: string;
  completionRate: number | null;
  completionStatus?: string | null;
  evidenceDescription?: string | null;
  notes?: string | null;
}

/** Một kỳ báo cáo tiến độ. */
export interface ProgressReportDetail {
  reportRound?: number | null;
  roundName?: string | null;
  reportingPeriodStart?: string | null;
  reportingPeriodEnd?: string | null;
  overallCompletionPct?: number | null;
  status?: string | null;
  completedContent?: string | null;
  pendingContent?: string | null;
  nextPeriodPlan?: string | null;
  piRecommendations?: string | null;
  evaluationResult?: string | null;
  evaluationComments?: string | null;
  evaluatedByName?: string | null;
  evaluatedAt?: string | null;
  submittedAt?: string | null;
  reportFileUrl?: string | null;
  files?: DossierFile[] | null;
  items?: ProgressReportItemDetail[] | null;
}

export function ProgressReportDetailSheet({
  item,
  open,
  onOpenChange,
}: {
  item: ProgressReportDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  if (!item) return null;

  const title =
    item.roundName?.trim() || t("dossierDetail.roundFallback", { n: item.reportRound ?? "" });
  const period =
    item.reportingPeriodStart && item.reportingPeriodEnd
      ? `${item.reportingPeriodStart} – ${item.reportingPeriodEnd}`
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="pr-6">{title}</SheetTitle>
          <SheetDescription>{t("dossierDetail.progressDesc")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            {item.status && <StatusBadge status={item.status} />}
            {typeof item.overallCompletionPct === "number" && (
              <span className="text-sm font-medium text-foreground">
                {t("dossierDetail.completionPct", { pct: item.overallCompletionPct })}
              </span>
            )}
          </div>

          <Field label={t("dossierDetail.period")} value={period} />
          <Field
            label={t("dossierDetail.submittedAt")}
            value={item.submittedAt ? formatDateTime(item.submittedAt) : null}
          />

          <Field label={t("dossierDetail.completedContent")} value={item.completedContent} />
          <Field label={t("dossierDetail.pendingContent")} value={item.pendingContent} />
          <Field label={t("dossierDetail.nextPeriodPlan")} value={item.nextPeriodPlan} />
          <Field label={t("dossierDetail.piRecommendations")} value={item.piRecommendations} />

          {/* Bảng tiến độ theo hoạt động (BM06) — chi tiết nhất mà chủ nhiệm nhập, trước giờ không
              màn nào hiện; Staff duyệt kỳ báo cáo mà không thấy từng hoạt động đạt bao nhiêu. */}
          {item.items && item.items.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                {t("dossierDetail.activities")}
              </p>
              <ul className="space-y-2">
                {item.items.map((a) => (
                  <li key={a.id} className="rounded-lg border border-border p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{a.activityName}</p>
                      <span className="shrink-0 text-sm font-medium text-foreground">
                        {a.completionRate}%
                      </span>
                    </div>
                    {a.evidenceDescription && (
                      <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                        {a.evidenceDescription}
                      </p>
                    )}
                    {a.notes && (
                      <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{a.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(item.evaluationResult || item.evaluationComments || item.evaluatedByName) && (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                {t("dossierDetail.evaluation")}
              </p>
              {item.evaluationResult && <StatusBadge status={item.evaluationResult} />}
              <Field label={t("dossierDetail.evaluationComments")} value={item.evaluationComments} />
              <Field label={t("dossierDetail.evaluatedBy")} value={item.evaluatedByName} />
              <Field
                label={t("dossierDetail.evaluatedAt")}
                value={item.evaluatedAt ? formatDateTime(item.evaluatedAt) : null}
              />
            </div>
          )}

          <LinkRow label={t("dossierDetail.reportLink")} url={item.reportFileUrl} />
          <FileList title={t("dossierDetail.attachments")} files={item.files} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
