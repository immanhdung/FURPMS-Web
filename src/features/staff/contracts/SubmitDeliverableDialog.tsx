import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitDeliverableMutation } from "@/hooks/useDeliverables";
import { cn } from "@/lib/utils";
import { deliverableDocumentService } from "@/services/api/deliverable-document.service";
import type { Deliverable } from "@/types/deliverable";

interface SubmitDeliverableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  deliverable: Deliverable | null;
}

/**
 * PI nộp sản phẩm.
 *
 * Trước đây form này chỉ có ô **dán URL** ("Đường dẫn file") — PI phải tự host file ở đâu
 * đó, và **không có ô minh chứng thử nghiệm** dù entity đã có cột `TrialEvidenceUrl`
 * (QĐ543 Điều 13.1 yêu cầu). Nay chọn file thật: upload lên hệ thống rồi tự lấy URL
 * download của BE, giống báo cáo tiến độ / tổng kết.
 */
export function SubmitDeliverableDialog({
  open,
  onOpenChange,
  contractId,
  deliverable,
}: SubmitDeliverableDialogProps) {
  const { t } = useTranslation();
  const submitMutation = useSubmitDeliverableMutation(contractId);

  const [productFile, setProductFile] = useState<File | null>(null);
  const [trialFile, setTrialFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  // Upload file (mặc định) HOẶC dán link — sản phẩm nặng thì upload không nổi.
  const [mode, setMode] = useState<"file" | "link">("file");
  const [linkUrl, setLinkUrl] = useState("");

  // URL đã nộp trước đó — nộp lại mà không chọn file mới thì giữ nguyên bản cũ.
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [existingTrialUrl, setExistingTrialUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && deliverable) {
      setProductFile(null);
      setTrialFile(null);
      setDescription(deliverable.description ?? "");
      setExistingFileUrl(deliverable.fileUrl ?? null);
      setLinkUrl(deliverable.fileUrl?.startsWith("http") ? deliverable.fileUrl : "");
      setMode(deliverable.fileUrl?.startsWith("http") ? "link" : "file");
      setExistingTrialUrl(deliverable.trialEvidenceUrl ?? null);
    }
  }, [open, deliverable]);

  const hasProduct = mode === "link" ? linkUrl.trim().length > 0 : Boolean(productFile || existingFileUrl);
  const isBusy = isUploading || submitMutation.isPending;

  const submit = async () => {
    if (!deliverable || !hasProduct) return;
    setIsUploading(true);
    try {
      // Upload trước, lấy URL download của hệ thống rồi mới gọi submit.
      const fileUrl =
        mode === "link"
          ? linkUrl.trim()
          : productFile
            ? (await deliverableDocumentService.upload(deliverable.id, productFile, false)).downloadUrl
            : existingFileUrl!;
      const trialEvidenceUrl = trialFile
        ? (await deliverableDocumentService.upload(deliverable.id, trialFile, true)).downloadUrl
        : existingTrialUrl ?? undefined;

      submitMutation.mutate(
        {
          id: deliverable.id,
          payload: { fileUrl, trialEvidenceUrl, description: description.trim() || undefined },
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } catch (error) {
      toast.error((error as { message?: string })?.message || t("toast.uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const filePicker = (
    id: string,
    label: string,
    hint: string,
    required: boolean,
    file: File | null,
    existingUrl: string | null,
    onPick: (f: File | null) => void
  ) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <Input id={id} type="file" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
      <p className="mt-1 text-xs text-muted-foreground">
        {file ? file.name : existingUrl ? t("contract.deliverable.keepExistingFile") : hint}
      </p>
    </div>
  );

  /**
   * Sản phẩm có thể là dataset/phần mềm rất nặng — ép upload là bất khả thi.
   * Cho chọn 1 trong 2 cách, miễn có đủ một đường để người chấm lấy được sản phẩm.
   */
  const modeToggle = (
    <div className="flex gap-1 rounded-lg border border-border p-0.5">
      {(["file", "link"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          className={cn(
            "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {m === "file" ? t("contract.deliverable.modeFile") : t("contract.deliverable.modeLink")}
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contract.deliverable.submitTitle")}</DialogTitle>
          <DialogDescription>{deliverable?.productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {modeToggle}

          {mode === "file"
            ? filePicker(
                "deliverable-file",
                t("contract.deliverable.productFile"),
                t("contract.deliverable.productFileHint"),
                true,
                productFile,
                existingFileUrl,
                setProductFile
              )
            : (
              <div>
                <label htmlFor="deliverable-link" className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("contract.deliverable.fileLink")} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="deliverable-link"
                  placeholder={t("contract.deliverable.fileLinkPlaceholder")}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">{t("contract.deliverable.modeLinkHint")}</p>
              </div>
            )}

          {/* QĐ543 Điều 13.1 — hồ sơ nghiệm thu cần minh chứng thử nghiệm. */}
          {filePicker(
            "deliverable-trial",
            t("contract.deliverable.trialEvidence"),
            t("contract.deliverable.trialEvidenceHint"),
            false,
            trialFile,
            existingTrialUrl,
            setTrialFile
          )}

          <div>
            <label htmlFor="deliverable-desc" className="mb-1.5 block text-sm font-medium text-foreground">
              {t("contract.disbursement.notes")}
            </label>
            <Textarea
              id="deliverable-desc"
              rows={3}
              placeholder={t("contract.deliverable.notesPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
            {t("common.cancel")}
          </Button>
          <Button type="button" disabled={!hasProduct || isBusy} onClick={submit}>
            {isBusy ? <Loader2 className="animate-spin" /> : <Upload />}
            {t("contract.deliverable.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
