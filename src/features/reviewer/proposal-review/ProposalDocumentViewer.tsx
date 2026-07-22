import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { renderAsync } from "docx-preview";
import { Download, ExternalLink, FileText, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProposalDocumentsQuery } from "@/hooks/useProposalDocuments";
import { proposalDocumentService } from "@/services/api/proposal-document.service";
import { cn } from "@/lib/utils";
import type { ProposalDocument } from "@/types/proposal-document";

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

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

/** So reviewers can actually read the submitted file while scoring, not just see its name. */
export function ProposalDocumentViewer({ proposalId }: { proposalId: string }) {
  const { t } = useTranslation();
  const { data: documents, isLoading } = useProposalDocumentsQuery(proposalId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Keyed by docId so a stale preview from the previously-selected document never renders under
  // the wrong one, and "still loading" is simply "no entry for this doc yet" — no separate
  // loading flag needed.
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [zoom, setZoom] = useState(1);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  const activeDoc = documents?.find((d) => d.id === selectedId) ?? documents?.[0];
  const fileKind = activeDoc ? getFileKind(activeDoc.fileName) : "other";

  useEffect(() => {
    if (!activeDoc || fileKind === "other") return;

    let cancelled = false;
    let objectUrl: string | null = null;

    proposalDocumentService
      .downloadBlob(proposalId, activeDoc.id)
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
        if (!cancelled) setPreview({ docId: activeDoc.id, rendered: true });
      })
      .catch(() => {
        if (!cancelled) setPreview({ docId: activeDoc.id, failed: true });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeDoc, proposalId, fileKind]);

  const previewForActiveDoc = activeDoc && preview?.docId === activeDoc.id ? preview : null;
  const previewUrl = previewForActiveDoc && "url" in previewForActiveDoc ? previewForActiveDoc.url : null;
  const previewError = Boolean(previewForActiveDoc && "failed" in previewForActiveDoc);
  const isPreviewLoading = Boolean(activeDoc && fileKind !== "other" && !previewForActiveDoc);

  const openInNewTab = async (doc: ProposalDocument) => {
    const blob = await proposalDocumentService.downloadBlob(proposalId, doc.id);
    window.open(URL.createObjectURL(blob), "_blank", "noopener");
  };

  const canZoom = Boolean(activeDoc) && fileKind !== "other" && !previewError && !isPreviewLoading;
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, Number((z - ZOOM_STEP).toFixed(2))));
  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, Number((z + ZOOM_STEP).toFixed(2))));

  if (isLoading) return <Skeleton className="h-[75vh] w-full rounded-xl" />;

  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t("reviewWorkspace.noDocuments")}
        description={t("reviewWorkspace.noDocumentsDesc")}
        className="h-[75vh]"
      />
    );
  }

  return (
    <div className="flex h-[75vh] flex-col overflow-hidden rounded-xl border border-border bg-card">
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
            <Button size="sm" variant="outline" onClick={() => openInNewTab(activeDoc)}>
              <ExternalLink />
              {t("reviewWorkspace.openInNewTab")}
            </Button>
          )}
        </div>
      </div>

      <div className="relative flex-1 overflow-auto bg-muted/30">
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
            {fileKind === "docx" && (
              <div
                ref={docxContainerRef}
                className={cn("docx-preview-container p-4", isPreviewLoading && "hidden")}
                style={{ zoom }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
