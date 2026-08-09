import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDisbursementEvidenceQuery,
  useUploadDisbursementEvidenceMutation,
  openDisbursementEvidence,
} from "@/hooks/useDisbursementEvidence";
import { useMultiFileUpload } from "@/hooks/useMultiFileUpload";

/** Minh chứng 1 đợt giải ngân (rule tuần 10): Staff upload file HĐ/chứng từ; ai cũng mở xem được. */
export function DisbursementEvidence({ disbursementId, canManage }: { disbursementId: number; canManage: boolean }) {
  const { t } = useTranslation();
  const { data: files } = useDisbursementEvidenceQuery(disbursementId);
  const upload = useUploadDisbursementEvidenceMutation(disbursementId);
  // Một đợt giải ngân thường kèm cả xấp chứng từ — chọn một lượt.
  const { handleFiles, progress, isUploading } = useMultiFileUpload({
    upload: (file) => upload.mutateAsync(file),
  });
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-t border-border/60 pt-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{t("contract.disbursement.evidence")}</p>
        {canManage && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
              {progress ? `${progress.done}/${progress.total}` : t("contract.disbursement.uploadEvidence")}
            </Button>
          </>
        )}
      </div>
      {(files?.length ?? 0) === 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">{t("contract.disbursement.noEvidence")}</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {files!.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => openDisbursementEvidence(disbursementId, f.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <FileText className="size-3" />
                {f.fileName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
