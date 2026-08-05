import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download, ExternalLink, FlaskConical, Package } from "lucide-react";
import { deliverableDocumentService } from "@/services/api/deliverable-document.service";
import type { Deliverable } from "@/types/deliverable";

/** Link ngoài hợp lệ = có scheme http(s). "abc.com" trình duyệt hiểu là đường dẫn TƯƠNG ĐỐI. */
export const isExternalLink = (url?: string | null) => Boolean(url && /^https?:\/\//i.test(url));

/** Đường dẫn nội bộ do BE sinh sau khi upload (bắt đầu bằng "/"), không phải link người dùng dán. */
const isInternalPath = (url?: string | null) => Boolean(url && url.startsWith("/"));

/**
 * File sản phẩm đã nộp — dùng chung cho màn Staff (tab Sản phẩm) và màn PI.
 *
 * Trước đây cả 2 màn chỉ render đúng `<a href={fileUrl}>`:
 *  - PI upload file → `fileUrl` là đường dẫn nội bộ **cần Bearer token**, bấm vào là 401/không ra gì;
 *  - PI dán link thiếu scheme ("abc.com") → trình duyệt nối vào URL hiện tại, bấm vào lạc sang
 *    trang trống;
 *  - **File đã upload không hề được liệt kê**, minh chứng thử nghiệm (QĐ543 Điều 13.1) cũng không —
 *    nên Staff nghiệm thu mà không thấy sản phẩm nào.
 */
export function DeliverableFiles({ deliverable }: { deliverable: Deliverable }) {
  const { t } = useTranslation();

  const { data: docs } = useQuery({
    queryKey: ["deliverable-documents", deliverable.id],
    queryFn: () => deliverableDocumentService.list(deliverable.id),
    enabled: Boolean(deliverable.submittedAt),
  });

  const download = async (documentId: string, fileName: string) => {
    try {
      // Phải tải qua axios mới kèm được Authorization; <a href> trần luôn 401.
      const blob = await deliverableDocumentService.downloadBlob(deliverable.id, documentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("toast.downloadFailed"));
    }
  };

  const externalLinks = [
    { url: deliverable.fileUrl, icon: Package, label: t("contract.deliverable.openFile") },
    { url: deliverable.trialEvidenceUrl, icon: FlaskConical, label: t("contract.deliverable.openTrialEvidence") },
  ].filter((x) => x.url && !isInternalPath(x.url));

  if (externalLinks.length === 0 && (!docs || docs.length === 0)) return null;

  return (
    <div className="space-y-1.5">
      {externalLinks.map(({ url, icon: Icon, label }) =>
        isExternalLink(url) ? (
          <a
            key={label}
            href={url!}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink className="size-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </a>
        ) : (
          // Link hỏng (thiếu http/https) — hiện nguyên văn để PI biết mà sửa,
          // KHÔNG bọc thẻ <a> nữa vì bấm vào chỉ dẫn đi lạc.
          <p key={label} className="flex items-center gap-1.5 text-xs text-destructive">
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{t("contract.deliverable.badLink", { url })}</span>
          </p>
        )
      )}

      {docs?.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => download(d.id, d.originalFileName)}
          className="flex w-full items-center gap-1.5 text-left text-xs text-primary hover:underline"
        >
          <Download className="size-3.5 shrink-0" />
          <span className="truncate">{d.originalFileName}</span>
        </button>
      ))}
    </div>
  );
}
