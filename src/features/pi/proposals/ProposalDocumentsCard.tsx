import { useRef, useState } from "react";
import { Download, FileUp, Loader2, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useDeleteProposalDocumentMutation,
  useProposalDocumentsQuery,
  useUploadProposalDocumentMutation,
} from "@/hooks/useProposalDocuments";
import { useUploadPolicyQuery } from "@/hooks/useSystemSettings";
import { proposalDocumentService } from "@/services/api/proposal-document.service";
import { DOCUMENT_TYPES } from "@/types/proposal-document";
import { formatDateTime } from "@/utils/format";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Tài liệu đính kèm đề xuất (QĐ 543 Điều 6.4: thuyết minh + lý lịch khoa học).
 * Giới hạn dung lượng/định dạng lấy từ cấu hình hệ thống để chặn ngay trên trình duyệt,
 * thay vì để người dùng chờ upload xong mới báo lỗi.
 */
export function ProposalDocumentsCard({ proposalId, editable }: { proposalId: string; editable: boolean }) {
  const { data: documents, isLoading } = useProposalDocumentsQuery(proposalId);
  const { data: policy } = useUploadPolicyQuery();
  const uploadMutation = useUploadProposalDocumentMutation(proposalId);
  const deleteMutation = useDeleteProposalDocumentMutation(proposalId);

  const inputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<string>(DOCUMENT_TYPES[0]);
  const [localError, setLocalError] = useState<string | null>(null);

  const maxMb = policy?.maxFileSizeMb ?? 10;
  const allowed = policy?.allowedExtensions ?? [];

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setLocalError(null);

    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
    if (allowed.length > 0 && !allowed.includes(ext)) {
      setLocalError(`Định dạng ${ext || "này"} không được phép. Chỉ nhận: ${allowed.join(", ")}.`);
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      setLocalError(`File ${formatSize(file.size)} vượt giới hạn ${maxMb} MB.`);
      return;
    }

    uploadMutation.mutate(
      { file, documentType },
      { onSuccess: () => { if (inputRef.current) inputRef.current.value = ""; } }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
        <CardDescription>
          Supporting files for this proposal — the signed thuyết minh, the PI's lý lịch khoa học, and any evidence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : !documents || documents.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            <Paperclip className="size-4" />
            No files attached yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{d.fileName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.documentType && <span>{d.documentType} · </span>}
                    {formatSize(d.fileSizeBytes)} · {formatDateTime(d.uploadedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="sm" variant="ghost" asChild>
                    <a
                      href={proposalDocumentService.downloadUrl(proposalId, d.id)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Download ${d.fileName}`}
                    >
                      <Download />
                    </a>
                  </Button>
                  {editable && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Remove ${d.fileName}`}
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(d.id)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {editable && (
          <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={allowed.join(",")}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <Button
                type="button"
                size="sm"
                disabled={uploadMutation.isPending}
                onClick={() => inputRef.current?.click()}
              >
                {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : <FileUp />}
                Choose file
              </Button>
            </div>

            {localError ? (
              <p className="text-xs text-destructive">{localError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Up to {maxMb} MB. {allowed.length > 0 && `Accepted: ${allowed.join(", ")}`}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
