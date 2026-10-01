import { useTranslation } from "react-i18next";
import { FileCheck2 } from "lucide-react";
import { useProgressReportDocumentsQuery } from "@/hooks/useProgressReports";
import { progressReportDocumentService } from "@/services/api/progress-report-document.service";

/** Loại tài liệu của biên bản họp Hội đồng đánh giá tiến độ (khớp BE `PROGRESS_MINUTES`). */
export const PROGRESS_MINUTES = "PROGRESS_MINUTES";

/**
 * Biên bản họp Hội đồng đánh giá tiến độ đã đính kèm vào kỳ báo cáo — để cả PI lẫn Staff mở xem
 * căn cứ của kết luận Đạt/Không đạt (QĐ543 Điều 10.1). Không có biên bản thì không hiện gì.
 */
export function ProgressMinutesLinks({ reportId }: { reportId: string }) {
  const { t } = useTranslation();
  const { data: docs } = useProgressReportDocumentsQuery(reportId);
  const minutes = (docs ?? []).filter((d) => d.documentType === PROGRESS_MINUTES);
  if (minutes.length === 0) return null;

  const open = async (documentId: string) => {
    const blob = await progressReportDocumentService.downloadBlob(reportId, documentId);
    window.open(URL.createObjectURL(blob), "_blank", "noopener");
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="text-muted-foreground">{t("reports.minutes")}:</span>
      {minutes.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => open(d.id)}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <FileCheck2 className="size-3.5" />
          {d.fileName}
        </button>
      ))}
    </div>
  );
}
