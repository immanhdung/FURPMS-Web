import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useContractDocumentsQuery,
  useUploadContractDocMutation,
  openContractDoc,
} from "@/hooks/useContractDocuments";

/** Hồ sơ hợp đồng đã ký (BM05): Staff upload bản Word/scan có chữ ký; ai cũng mở xem. */
export function ContractSignedDocs({ contractId }: { contractId: string }) {
  const { t } = useTranslation();
  const { data: files } = useContractDocumentsQuery(contractId);
  const upload = useUploadContractDocMutation(contractId);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{t("contract.signedDocs")}</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload.mutate(f);
            e.target.value = "";
          }}
        />
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
          {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
          {t("contract.uploadSigned")}
        </Button>
      </div>
      {(files?.length ?? 0) === 0 ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{t("contract.noSignedDocs")}</p>
      ) : (
        <ul className="mt-1.5 space-y-1">
          {files!.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => openContractDoc(contractId, f.id)}
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
