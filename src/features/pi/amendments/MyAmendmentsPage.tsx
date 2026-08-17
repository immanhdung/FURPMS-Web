import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { FileDown, FilePenLine, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useMyContractsQuery } from "@/hooks/useMyContracts";
import {
  useAmendmentCategoriesQuery,
  useAmendmentsQuery,
  useCreateAmendmentMutation,
} from "@/hooks/useAmendments";
import { formatDate } from "@/utils/format";

import { amendmentService } from "@/services/api/amendment.service";
import { contractService } from "@/services/api/contract.service";
import { toast } from "sonner";
import { AMENDMENT_STATUS } from "@/types/amendment";
/**
 * PI gửi yêu cầu ĐIỀU CHỈNH hợp đồng — đổi phạm vi / kinh phí / thời gian / nhân sự,
 * trong đó có **xin gia hạn** (QĐ543: gia hạn tối đa 6 tháng).
 *
 * BE **đã cho phép PI tạo** từ trước (`POST /contracts/{id}/amendments` chỉ cần là chủ
 * hợp đồng; chỉ duyệt/từ chối mới giới hạn Staff/Admin) — nhưng FE chỉ có màn bên
 * `staff/contracts`, nên PI không có đường vào và luồng này coi như tắc.
 */
export function MyAmendmentsPage() {
  const { t } = useTranslation();
  const { data: contracts, proposalTitleById, isLoading: isContractsLoading } = useMyContractsQuery();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Biên bản thanh lý (BM13) — chủ nhiệm là Bên B ký, nên cũng phải tự tải được. */
  const handleExportSettlement = async () => {
    if (!contractId) return;
    setExportingId("settlement");
    try {
      download(await contractService.exportSettlementWord(contractId), `BienBanThanhLy-${contractId.slice(0, 8)}.docx`);
    } catch {
      toast.error(t("contract.exportWordError"));
    } finally {
      setExportingId(null);
    }
  };

  const handleExportAmendment = async (id: string) => {
    setExportingId(id);
    try {
      download(await amendmentService.exportWord(id), `PhuLucHopDong-${id.slice(0, 8)}.docx`);
    } catch {
      toast.error(t("contract.amendment.exportWordError"));
    } finally {
      setExportingId(null);
    }
  };

  const handleExportContract = async () => {
    if (!contractId) return;
    setExportingId("contract");
    try {
      download(await contractService.exportWord(contractId), `HopDong-${contractId.slice(0, 8)}.docx`);
    } catch {
      toast.error(t("contract.exportWordError"));
    } finally {
      setExportingId(null);
    }
  };
  const [open, setOpen] = useState(false);

  const contractId = selectedContractId ?? contracts?.[0]?.id ?? null;
  const { data: amendments, isLoading } = useAmendmentsQuery(contractId);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-accent/15 to-primary/10 text-brand-accent">
            <FilePenLine className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("amendments.myTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("amendments.mySubtitle")}</p>
          </div>
        </div>
        {contractId && (
          <Button onClick={() => setOpen(true)}>
            <Plus />
            {t("amendments.newRequest")}
          </Button>
        )}
      </motion.div>

      {isContractsLoading ? (
        <Skeleton className="h-10 w-64 rounded-lg" />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          icon={FilePenLine}
          title={t("reports.noContracts")}
          description={t("reports.progressNoContractsDesc")}
        />
      ) : (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reports.contractLabel")}</label>
            <Select value={contractId ?? undefined} onValueChange={setSelectedContractId}>
              <SelectTrigger className="w-full sm:w-96">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contracts.map((c) => {
                  const title = proposalTitleById.get(c.proposalId);
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      {c.contractNumber
                        ? `${t("reports.contractNo", { no: c.contractNumber })}${title ? ` — ${title}` : ""}`
                        : title || c.id}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/*
              Chủ nhiệm là BÊN B ký hợp đồng — phải tự tải được bản Word của chính mình.
              Trước 17/08 endpoint xuất chặn cứng `Roles = "Admin,Staff"` nên PI muốn xem lại
              hợp đồng của mình cũng phải nhắn chuyên viên gửi hộ. Nay máy chủ kiểm QUYỀN SỞ HỮU:
              PI khác hoặc người chấm gọi vào vẫn nhận 403.
            */}
            {contractId && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2"
                disabled={exportingId === "contract"}
                onClick={handleExportContract}
              >
                {exportingId === "contract" ? <Loader2 className="animate-spin" /> : <FileDown />}
                {t("contract.exportWord")}
              </Button>
            )}
            {contractId && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 ml-2"
                disabled={exportingId === "settlement"}
                onClick={handleExportSettlement}
              >
                {exportingId === "settlement" ? <Loader2 className="animate-spin" /> : <FileDown />}
                {t("contract.exportSettlementWord")}
              </Button>
            )}
          </div>

          {isLoading ? (
            <Skeleton className="h-24 w-full rounded-lg" />
          ) : !amendments || amendments.length === 0 ? (
            <EmptyState
              icon={FilePenLine}
              title={t("amendments.empty")}
              description={t("amendments.emptyDesc")}
              className="min-h-40"
            />
          ) : (
            <ul className="space-y-2">
              {amendments.map((a) => (
                <li key={a.id} className="space-y-1.5 rounded-lg border border-border bg-card/95 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{a.categoryName ?? a.changeDescription}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-sm text-foreground">{a.changeDescription}</p>
                  {a.justification && <p className="text-xs text-muted-foreground">{a.justification}</p>}
                  <p className="text-xs text-muted-foreground">{formatDate(a.requestedAt)}</p>
                  {a.reviewerComments && (
                    <p className="text-xs text-foreground">
                      {t("amendments.reviewNotes")}: {a.reviewerComments}
                    </p>
                  )}

                  {/*
                    Chủ nhiệm chính là BÊN KÝ phụ lục (BM05 Điều 6.1) nên phải tự tải được, không
                    phải nhắn chuyên viên gửi hộ. Chỉ hiện khi ĐÃ DUYỆT — khớp với chặn 409 của
                    máy chủ; bày nút rồi báo lỗi chỉ làm người dùng tưởng hệ thống hỏng.
                  */}
                  {a.status === AMENDMENT_STATUS.APPROVED && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={exportingId === a.id}
                      onClick={() => handleExportAmendment(a.id)}
                    >
                      {exportingId === a.id ? <Loader2 className="animate-spin" /> : <FileDown />}
                      {t("contract.amendment.exportWord")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {contractId && (
        <CreateAmendmentDialog open={open} onOpenChange={setOpen} contractId={contractId} />
      )}
    </div>
  );
}

function CreateAmendmentDialog({
  open,
  onOpenChange,
  contractId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
}) {
  const { t } = useTranslation();
  const { data: categories } = useAmendmentCategoriesQuery();
  const createMutation = useCreateAmendmentMutation(contractId);

  const [categoryId, setCategoryId] = useState<string>("");
  const [changeDescription, setChangeDescription] = useState("");
  const [justification, setJustification] = useState("");
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");

  // Loại "Gia hạn thời gian thực hiện" (code EXTENSION) là loại duy nhất BE tự áp dụng.
  const isExtension = (categories ?? []).find((c) => String(c.id) === categoryId)?.code === "EXTENSION";

  const canSubmit =
    categoryId &&
    changeDescription.trim().length > 0 &&
    justification.trim().length > 0 &&
    (!isExtension || Number(newValue) > 0) &&
    !createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("amendments.newRequest")}</DialogTitle>
          <DialogDescription>{t("amendments.newRequestDesc")}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("amendments.category")} <span className="text-destructive">*</span>
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder={t("amendments.categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("amendments.changeDescription")} <span className="text-destructive">*</span>
            </label>
            <Textarea
              rows={2}
              placeholder={t("amendments.changeDescriptionHint")}
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
            />
          </div>

          {/* Gia hạn là loại DUY NHẤT hệ thống tự áp dụng (cộng tháng vào hạn hợp đồng),
              và BE chỉ hiểu SỐ NGUYÊN tháng. Gõ "3 tháng" là không áp dụng được ⇒ ép nhập số. */}
          {isExtension ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("amendments.extensionMonths")} <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min={1}
                max={6}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">{t("amendments.extensionMonthsHint")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t("amendments.oldValue")}</label>
                <Input value={oldValue} onChange={(e) => setOldValue(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t("amendments.newValue")}</label>
                <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("amendments.justification")} <span className="text-destructive">*</span>
            </label>
            <Textarea
              rows={3}
              placeholder={t("amendments.justificationHint")}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() =>
              createMutation.mutate(
                {
                  categoryId: Number(categoryId),
                  changeDescription: changeDescription.trim(),
                  justification: justification.trim(),
                  oldValue: oldValue.trim() || undefined,
                  newValue: newValue.trim() || undefined,
                  requiresRectorApproval: false,
                },
                {
                  onSuccess: () => {
                    setChangeDescription("");
                    setJustification("");
                    setOldValue("");
                    setNewValue("");
                    onOpenChange(false);
                  },
                }
              )
            }
          >
            {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            {t("amendments.send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
