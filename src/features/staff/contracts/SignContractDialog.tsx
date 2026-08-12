import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileSignature } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignContractMutation } from "@/hooks/useContracts";
import { useContractDocumentsQuery } from "@/hooks/useContractDocuments";

/**
 * Ghi nhận hợp đồng đã ký — hệ thống KHÔNG ký thay ai.
 *
 * QĐ543 BM05 Điều 7.2: hợp đồng ký điện tử trên phần mềm ngoài (Econtract), hệ thống này chỉ sinh
 * biểu mẫu rồi giữ bản đã ký làm bằng chứng. Vì vậy chưa tải bản ký lên thì không ghi nhận được —
 * nút mờ kèm câu chỉ đường, thay vì bấm được rồi mới ăn lỗi từ máy chủ.
 *
 * Ngày ký nhập tay vì đó là ngày GHI TRÊN GIẤY, gần như luôn khác ngày ngồi nhập vào hệ thống, mà
 * mọi mốc hợp đồng lại tính theo ngày trên giấy.
 */
export function SignContractDialog({
  open,
  onOpenChange,
  contractId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
}) {
  const { t } = useTranslation();
  const signMutation = useSignContractMutation();
  const { data: files } = useContractDocumentsQuery(contractId ?? "");
  const [signedOn, setSignedOn] = useState(() => new Date().toISOString().slice(0, 10));

  const hasSignedCopy = (files?.length ?? 0) > 0;
  const today = new Date().toISOString().slice(0, 10);
  const futureDate = signedOn > today;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contract.signTitle")}</DialogTitle>
          <DialogDescription>{t("contract.signDesc")}</DialogDescription>
        </DialogHeader>

        {!hasSignedCopy ? (
          <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
            {t("contract.signNeedsCopy")}
          </p>
        ) : (
          <div>
            <label htmlFor="signedOn" className="mb-1.5 block text-sm font-medium text-foreground">
              {t("contract.signedOn")}
            </label>
            <Input
              id="signedOn"
              type="date"
              max={today}
              value={signedOn}
              aria-invalid={futureDate}
              onChange={(e) => setSignedOn(e.target.value)}
            />
            <p className={`mt-1 text-xs ${futureDate ? "text-destructive" : "text-muted-foreground"}`}>
              {futureDate ? t("contract.signedOnFuture") : t("contract.signedOnHint")}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!contractId || !hasSignedCopy || futureDate || signMutation.isPending}
            onClick={() =>
              contractId &&
              signMutation.mutate({ id: contractId, signedOn }, { onSuccess: () => onOpenChange(false) })
            }
          >
            <FileSignature />
            {t("contract.signConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
