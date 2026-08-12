import { useTranslation } from "react-i18next";
import { Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeliverablesQuery } from "@/hooks/useDeliverables";
import { useLinkDeliverableMutation } from "@/hooks/useDisbursements";
import { DISBURSEMENT_STATUS, type Disbursement } from "@/types/disbursement";

/**
 * Sản phẩm minh chứng của một đợt giải ngân (P5 — thầy: *"mỗi đợt giải ngân nên có
 * sản phẩm minh chứng cho tiến độ đó, không phải chỉ input % và note"*).
 *
 * Trước đây sản phẩm chỉ được ghép TỰ ĐỘNG lúc sinh lịch và chỉ với PARTIAL (đợt thứ i
 * ↔ sản phẩm thứ i) — ghép sai thì chịu, còn WHOLE thì không bao giờ có. Đây là chỗ
 * Staff sửa lại cho đúng thực tế.
 */
export function DisbursementDeliverableLink({
  contractId,
  disbursement,
  canManage,
}: {
  contractId: string;
  disbursement: Disbursement;
  canManage: boolean;
}) {
  const { t } = useTranslation();
  const linkMutation = useLinkDeliverableMutation(contractId);
  const isDisbursed = disbursement.status === DISBURSEMENT_STATUS.DISBURSED;
  const editable = canManage && !isDisbursed;

  // Chỉ nạp danh sách khi thật sự cần chọn — đợt đã gắn/đã giải ngân thì khỏi gọi API.
  const { data: deliverables, isLoading } = useDeliverablesQuery(
    editable && !disbursement.deliverableId ? contractId : null,
  );

  if (disbursement.deliverableId) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
        <Package className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground">{disbursement.deliverableName}</span>
        {disbursement.deliverableAcceptanceStatus && (
          <StatusBadge status={disbursement.deliverableAcceptanceStatus} />
        )}
        {editable && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-6 px-2 text-xs"
            disabled={linkMutation.isPending}
            onClick={() => linkMutation.mutate({ id: disbursement.id, deliverableId: null })}
          >
            <X className="size-3" />
            {t("contract.disbursement.unlinkProduct")}
          </Button>
        )}
      </div>
    );
  }

  if (!editable) {
    return (
      <p className="text-xs text-muted-foreground">{t("contract.disbursement.noProduct")}</p>
    );
  }

  /*
   * Hợp đồng CHƯA khai sản phẩm nào thì đừng dựng ô chọn rỗng.
   *
   * Radix Select mở ra với `SelectContent` không có mục nào — lại nằm trong Sheet — sẽ quẩn ở
   * khâu đo vị trí và làm treo giao diện. Mà kể cả không treo thì một ô chọn rỗng cũng vô nghĩa:
   * người dùng cần biết phải sang tab Sản phẩm khai trước, không phải bấm vào một danh sách trống.
   */
  if (isLoading) {
    return <p className="text-xs text-muted-foreground">{t("common.loading")}</p>;
  }

  if ((deliverables?.length ?? 0) === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {t("contract.disbursement.noProductToPick")}
      </p>
    );
  }

  return (
    <Select
      disabled={linkMutation.isPending}
      onValueChange={(value) =>
        linkMutation.mutate({ id: disbursement.id, deliverableId: Number(value) })
      }
    >
      <SelectTrigger className="h-8 w-full text-xs sm:w-72">
        <SelectValue placeholder={t("contract.disbursement.pickProduct")} />
      </SelectTrigger>
      <SelectContent>
        {(deliverables ?? []).map((d) => (
          <SelectItem key={d.id} value={String(d.id)}>
            {d.productName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
