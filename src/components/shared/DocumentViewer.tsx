import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { renderAsync } from "docx-preview";
import { Download, ExternalLink, FileText, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Đủ để hiện tên + tải nội dung. Cố ý KHÔNG buộc vào `ProposalDocument`: hồ sơ nghiệm thu
 *  (báo cáo tổng kết, sản phẩm, hợp đồng đã ký) dùng DTO khác nhưng cùng nhu cầu xem. */
export interface ViewableDocument {
  id: string;
  fileName: string;
  documentType?: string | null;
}

type FileKind = "pdf" | "docx" | "other";

function getFileKind(fileName: string): FileKind {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  // Only the modern .docx (OOXML) format is renderable — legacy .doc is a different binary
  // format docx-preview doesn't support.
  if (lower.endsWith(".docx")) return "docx";
  return "other";
}

type PreviewState = { docId: string; url: string } | { docId: string; rendered: true } | { docId: string; failed: true };

// Trang A4 mà docx-preview dựng ra rộng ~816px, trong khi khung xem chỉ chiếm nửa màn
// ⇒ mặc định 100% là tràn ra ngoài, người chấm chỉ thấy được nửa trái. Cho phép thu nhỏ
// sâu hơn để "vừa khung", muốn đọc kỹ thì tự phóng to.
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

interface DocumentViewerProps {
  documents: ViewableDocument[] | undefined;
  /** Lấy nội dung file. Phải đi qua axios để gửi kèm token — `<a href>` trần luôn ăn 401. */
  fetchBlob: (documentId: string) => Promise<Blob>;
  isLoading?: boolean;
  /** Chữ hiện khi không có file nào — mỗi chỗ dùng có ngữ cảnh riêng (đề cương / hồ sơ nghiệm thu). */
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

/**
 * So reviewers can actually read the submitted file while scoring, not just see its name.
 *
 * <p>Trước 18/08 component này gắn cứng vào tài liệu đề cương (`useProposalDocumentsQuery`), nên
 * tab **Nghiệm thu** chỉ hiện được trạng thái *"Đã tiếp nhận"* mà không mở được báo cáo tổng kết —
 * đúng lỗi Dũng báo. Nay nhận danh sách file + hàm tải từ ngoài để dùng lại cho mọi loại hồ sơ.</p>
 */
export function DocumentViewer({
  documents,
  fetchBlob,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  className,
}: DocumentViewerProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Keyed by docId so a stale preview from the previously-selected document never renders under
  // the wrong one, and "still loading" is simply "no entry for this doc yet" — no separate
  // loading flag needed.
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [zoom, setZoom] = useState(1);
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  /**
   * Thu trang cho vừa bề ngang khung xem. Không có bước này thì trang A4 (~816px) tràn ra
   * khỏi khung hẹp và người chấm chỉ đọc được nửa trái — đúng lỗi nhìn thấy khi test.
   */
  const fitToWidth = () => {
    // Đợi trình duyệt vẽ xong mới đo — gọi ngay sau renderAsync thì offsetWidth còn 0,
    // hàm thoát sớm và khung vẫn giữ 100% (đúng lỗi thấy khi test).
    requestAnimationFrame(() => {
      const page = docxContainerRef.current?.querySelector<HTMLElement>(".docx");
      const viewport = scrollAreaRef.current;
      if (!page || !viewport) return;

      const available = viewport.clientWidth - 32; // trừ padding hai bên
      const pageWidth = page.offsetWidth;
      if (pageWidth <= 0 || available <= 0) return;

      // Chỉ THU NHỎ cho vừa, không tự phóng to quá 100% (phóng lên chữ vỡ nét).
      setZoom(Math.max(ZOOM_MIN, Math.min(1, Number((available / pageWidth).toFixed(2)))));
    });
  };

  const activeDoc = documents?.find((d) => d.id === selectedId) ?? documents?.[0];
  const fileKind = activeDoc ? getFileKind(activeDoc.fileName) : "other";

  useEffect(() => {
    if (!activeDoc || fileKind === "other") return;

    let cancelled = false;
    let objectUrl: string | null = null;

    fetchBlob(activeDoc.id)
      .then(async (blob) => {
        if (cancelled) return;
        if (fileKind === "pdf") {
          objectUrl = URL.createObjectURL(blob);
          setPreview({ docId: activeDoc.id, url: objectUrl });
          return;
        }
        // docx-preview renders directly into the DOM node rather than returning markup.
        const container = docxContainerRef.current;
        if (!container) return;
        container.innerHTML = "";
        await renderAsync(blob, container);
        if (!cancelled) {
          setPreview({ docId: activeDoc.id, rendered: true });
          fitToWidth();
        }
      })
      .catch(() => {
        if (!cancelled) setPreview({ docId: activeDoc.id, failed: true });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeDoc, fetchBlob, fileKind]);

  const previewForActiveDoc = activeDoc && preview?.docId === activeDoc.id ? preview : null;
  const previewUrl = previewForActiveDoc && "url" in previewForActiveDoc ? previewForActiveDoc.url : null;
  const previewError = Boolean(previewForActiveDoc && "failed" in previewForActiveDoc);
  const isPreviewLoading = Boolean(activeDoc && fileKind !== "other" && !previewForActiveDoc);

  const openInNewTab = async (doc: ViewableDocument) => {
    const blob = await fetchBlob(doc.id);
    window.open(URL.createObjectURL(blob), "_blank", "noopener");
  };

  /** Tải hẳn về máy — có người muốn đọc offline / mở bằng Word thay vì xem trong trình duyệt. */
  const downloadFile = async (doc: ViewableDocument) => {
    const blob = await fetchBlob(doc.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const canZoom = Boolean(activeDoc) && fileKind !== "other" && !previewError && !isPreviewLoading;
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, Number((z - ZOOM_STEP).toFixed(2))));
  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, Number((z + ZOOM_STEP).toFixed(2))));

  if (isLoading) return <Skeleton className={cn("w-full rounded-xl", className ?? "h-[75vh]")} />;

  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyTitle ?? t("reviewWorkspace.noDocuments")}
        description={emptyDescription ?? t("reviewWorkspace.noDocumentsDesc")}
        className={className ?? "h-[75vh]"}
      />
    );
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-card", className ?? "h-[75vh]")}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
        {documents.length > 1 ? (
          <Select value={activeDoc?.id} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documents.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.documentType ? `${d.documentType} — ${d.fileName}` : d.fileName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="truncate text-sm font-medium text-foreground">{activeDoc?.fileName}</p>
        )}
        <div className="flex items-center gap-2">
          {canZoom && (
            <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={zoom <= ZOOM_MIN}
                onClick={zoomOut}
                aria-label={t("reviewWorkspace.zoomOut")}
              >
                <ZoomOut />
              </Button>
              <span className="w-11 text-center text-xs tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={zoom >= ZOOM_MAX}
                onClick={zoomIn}
                aria-label={t("reviewWorkspace.zoomIn")}
              >
                <ZoomIn />
              </Button>
            </div>
          )}
          {activeDoc && (
            <>
              <Button size="sm" variant="outline" onClick={() => downloadFile(activeDoc)}>
                <Download />
                {t("reviewWorkspace.download")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => openInNewTab(activeDoc)}>
                <ExternalLink />
                {t("reviewWorkspace.openInNewTab")}
              </Button>
            </>
          )}
        </div>
      </div>

      <div ref={scrollAreaRef} className="relative flex-1 overflow-auto bg-muted/30">
        {!activeDoc ? null : fileKind === "other" ? (
          <EmptyState
            icon={Download}
            title={t("reviewWorkspace.noPreview")}
            description={t("reviewWorkspace.noPreviewDesc")}
            action={
              <Button size="sm" onClick={() => openInNewTab(activeDoc)}>
                <ExternalLink />
                {t("reviewWorkspace.openInNewTab")}
              </Button>
            }
            className="h-full border-none"
          />
        ) : previewError ? (
          <EmptyState
            icon={FileText}
            title={t("reviewWorkspace.previewFailed")}
            description={t("reviewWorkspace.previewFailedDesc")}
            className="h-full border-none"
          />
        ) : (
          <>
            {isPreviewLoading && (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {fileKind === "pdf" && previewUrl && (
              <iframe src={previewUrl} title={activeDoc.fileName} className="h-full w-full" style={{ zoom }} />
            )}
            {/* Always mounted while active so docx-preview has a stable node to render into.
                No overflow-auto here — the outer panel is the single scroll container, so zooming
                grows this box and the outer scrollbars pick it up naturally. */}
            {/* Căn GIỮA theo chiều ngang: khung xem thường rộng hơn trang sau khi đã thu vừa,
                để trái như cũ thì trang lệch hẳn về một bên, nhìn như bị cắt. */}
            {fileKind === "docx" && (
              <div className={cn("flex justify-center p-4", isPreviewLoading && "hidden")} style={{ zoom }}>
                <div ref={docxContainerRef} className="docx-preview-container" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
