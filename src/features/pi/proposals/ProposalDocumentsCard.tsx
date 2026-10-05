import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMultiFileUpload } from "@/hooks/useMultiFileUpload";
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
  const { t } = useTranslation();
  const { data: documents, isLoading } = useProposalDocumentsQuery(proposalId);
  const { data: policy } = useUploadPolicyQuery();
  const uploadMutation = useUploadProposalDocumentMutation(proposalId);
  const deleteMutation = useDeleteProposalDocumentMutation(proposalId);

  const inputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<string>(DOCUMENT_TYPES[0]);
  const [localError, setLocalError] = useState<string | null>(null);

  const maxMb = policy?.maxFileSizeMb ?? 10;
  const allowed = policy?.allowedExtensions ?? [];

  // QĐ543 Điều 6.4 đòi ít nhất thuyết minh + lý lịch khoa học, thực tế còn thêm phụ lục —
  // chọn một lượt thay vì mở hộp thoại ba lần. Việc lọc dung lượng/định dạng nằm trong hook.
  const { handleFiles, progress, isUploading } = useMultiFileUpload({
    upload: (file) => uploadMutation.mutateAsync({ file, documentType }),
  });

  const onPick = (files: FileList | null) => {
    setLocalError(null);
    void handleFiles(files);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("proposal.attachments")}</CardTitle>
        <CardDescription>
          {t("proposal.attachmentsDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : !documents || documents.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            <Paperclip className="size-4" />
            {t("proposal.noFiles")}
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
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={allowed.join(",")}
                multiple
                onChange={(e) => {
                  onPick(e.target.files);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                size="sm"
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <FileUp />}
                {progress ? `${progress.done}/${progress.total}` : t("proposal.chooseFile")}
              </Button>
            </div>

            {localError ? (
              <p className="text-xs text-destructive">{localError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("proposal.uploadHint", {
                  max: maxMb,
                  types: allowed.length > 0 ? t("proposal.uploadAccepted", { types: allowed.join(", ") }) : "",
                })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
