import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CircleCheckBig, FileDown, FileSignature, Loader2, OctagonX } from "lucide-react";
import { contractService } from "@/services/api/contract.service";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContractQuery, useTerminateContractMutation } from "@/hooks/useContracts";
import { useProposalQuery } from "@/hooks/useProposals";
import { ContractMilestoneTimeline } from "@/features/staff/contracts/ContractMilestoneTimeline";
import { ContractSignedDocs } from "@/features/staff/contracts/ContractSignedDocs";
import { SignContractDialog } from "@/features/staff/contracts/SignContractDialog";
import { ProgressReportsPanel } from "@/features/staff/contracts/ProgressReportsPanel";
import { DisbursementsPanel } from "@/features/staff/contracts/DisbursementsPanel";
import { DeliverablesPanel } from "@/features/staff/contracts/DeliverablesPanel";
import { FinalReportPanel } from "@/features/staff/contracts/FinalReportPanel";
import { AmendmentsPanel } from "@/features/staff/contracts/AmendmentsPanel";
import { SettlementPanel } from "@/features/staff/contracts/SettlementPanel";
import { useIsManaging } from "@/hooks/useActiveRole";
import { proposalTitle, formatDate } from "@/utils/format";

interface ContractDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
}

export function ContractDetailSheet({ open, onOpenChange, contractId }: ContractDetailSheetProps) {
  const { t } = useTranslation();
  const { data: contract, isLoading } = useContractQuery(contractId);
  const { data: proposal } = useProposalQuery(contract?.proposalId ?? null);
  const [signOpen, setSignOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState("");
  const terminateMutation = useTerminateContractMutation();
  const [exporting, setExporting] = useState(false);

  const [exportingSettlement, setExportingSettlement] = useState(false);

  /** BM13 — biên bản thanh lý; cùng đường tải như hợp đồng gốc (qua axios để kèm token). */
  const handleExportSettlement = async () => {
    if (!contract) return;
    setExportingSettlement(true);
    try {
      const blob = await contractService.exportSettlementWord(contract.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BienBanThanhLy-${contract.contractNumber ?? contract.id}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("contract.exportWordError"));
    } finally {
      setExportingSettlement(false);
    }
  };

  const handleExportWord = async () => {
    if (!contract) return;
    setExporting(true);
    try {
      const blob = await contractService.exportWord(contract.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HopDong-${contract.contractNumber ?? contract.id}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("contract.exportWordError"));
    } finally {
      setExporting(false);
    }
  };
  // Chỉ Admin/Staff được sinh lịch & xác nhận chi tiền; PI chỉ xem (BE cũng chặn 403).
  // Đọc theo VAI ĐANG CHỌN chứ không phải vai người đó có: người đa vai chuyển sang Giảng viên
  // thì không nên còn thấy nút của Phòng QLKH ở đây (rule #23).
  const canManage = useIsManaging();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent resizable defaultWidth={820} className="flex w-full flex-col sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>{contract?.contractNumber || contract?.scopeTitle || t("contract.detailTitle")}</SheetTitle>
          <SheetDescription>{proposalTitle(proposal, t("contract.loadingProposal"))}</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <PageLoader label={t("contract.loadingContract")} />
        ) : !contract ? null : (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-5 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                {contract.status && <StatusBadge status={contract.status} />}
                <span className="text-xs text-muted-foreground">
                  {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                </span>
                {/* Duyệt gia hạn là BE đổi luôn EndDate. Không đối chiếu với hạn GỐC thì
                    nhìn vào chỉ thấy một cái ngày, không biết đã gia hạn hay chưa. */}
                {contract.originalEndDate && contract.originalEndDate !== contract.endDate && (
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    {t("contract.extendedFrom", { date: formatDate(contract.originalEndDate) })}
                  </span>
                )}
                {contract.maxExtensionMonths != null && (
                  <span className="text-xs text-muted-foreground">
                    {t("contract.maxExtension", { n: contract.maxExtensionMonths })}
                  </span>
                )}
              </div>

              {/* Kết quả nghiệm thu thuộc ĐỀ TÀI, không phải trạng thái thanh lý HỢP ĐỒNG.
                  Hiện riêng hai mốc để tránh chữ "Hoàn thành" bị hiểu là đã ký BM13. */}
              {contract.projectStatus === "COMPLETED" && contract.status !== "SETTLED" && (
                <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 p-3">
                  <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("contract.acceptanceCompleted")}</p>
                    <p className="text-xs text-muted-foreground">{t("contract.acceptanceCompletedHint")}</p>
                  </div>
                </div>
              )}

              {contract.status === "TERMINATED" && contract.terminatedReason && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm font-medium text-destructive">{t("contract.terminatedReason")}</p>
                  <p className="mt-1 text-sm text-foreground whitespace-pre-wrap break-words">{contract.terminatedReason}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{t("contract.sideARep")}</p>
                  <p className="mt-0.5 text-sm text-foreground">{contract.sideARepresentative || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{t("contract.econtract")}</p>
                  {/* Chỉ hiện link khi là URL thật — tránh render giá trị rác (vd id "12") thành link. */}
                  {contract.econtractUrl && /^https?:\/\//i.test(contract.econtractUrl) ? (
                    <a
                      href={contract.econtractUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block truncate text-sm text-primary hover:underline"
                    >
                      {t("contract.openEcontract")}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-foreground">{contract.econtractUrl || "—"}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Chỉ hiện khi CHƯA ký — ký rồi thì không có gì để bấm nữa. */}
                {contract.status === "PENDING_SIGNATURE" && (
                  <Button size="sm" onClick={() => setSignOpen(true)}>
                    <FileSignature />
                    {t("contract.signContract")}
                  </Button>
                )}
                {canManage && (
                  <Button size="sm" variant="outline" onClick={handleExportWord} disabled={exporting}>
                    {exporting ? <Loader2 className="animate-spin" /> : <FileDown />}
                    {t("contract.exportWord")}
                  </Button>
                )}
                {/* BM13 — biên bản thanh lý (QĐ543 Điều 13.2), chỉ có nghĩa khi hợp đồng đã ký. */}
                {canManage && contract.status !== "PENDING_SIGNATURE" && contract.status !== "TERMINATED" && (
                  <Button size="sm" variant="outline" onClick={handleExportSettlement} disabled={exportingSettlement}>
                    {exportingSettlement ? <Loader2 className="animate-spin" /> : <FileDown />}
                    {t("contract.exportSettlementWord")}
                  </Button>
                )}
                {canManage && contract.projectStatus !== "COMPLETED"
                  && (contract.status === "ACTIVE" || contract.status === "UNDER_REVIEW") && (
                  <Button size="sm" variant="destructive" onClick={() => setTerminateOpen(true)}>
                    <OctagonX />
                    {t("contract.terminate")}
                  </Button>
                )}
              </div>

              {canManage && <ContractSignedDocs contractId={contract.id} />}

      <SignContractDialog open={signOpen} onOpenChange={setSignOpen} contractId={contractId} />

              <Dialog open={terminateOpen} onOpenChange={setTerminateOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("contract.terminateTitle")}</DialogTitle>
                    <DialogDescription>{t("contract.terminateDesc")}</DialogDescription>
                  </DialogHeader>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      {t("contract.terminateReason")} <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      rows={4}
                      value={terminateReason}
                      onChange={(event) => setTerminateReason(event.target.value)}
                      placeholder={t("contract.terminateReasonPlaceholder")}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTerminateOpen(false)}>{t("common.cancel")}</Button>
                    <Button
                      variant="destructive"
                      disabled={terminateReason.trim().length < 20 || terminateMutation.isPending}
                      onClick={() => terminateMutation.mutate(
                        { id: contract.id, reason: terminateReason.trim() },
                        { onSuccess: () => { setTerminateReason(""); setTerminateOpen(false); } }
                      )}
                    >
                      {terminateMutation.isPending ? <Loader2 className="animate-spin" /> : <OctagonX />}
                      {t("contract.terminateConfirm")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Thứ tự tab theo đúng dòng đời hợp đồng: tiền → sản phẩm → báo cáo → tổng kết → điều chỉnh → chốt sổ */}
              <Tabs defaultValue="timeline">
                {/* Lưới đều 7 tab — sheet rộng thì 4/hàng, hẹp thì 2/hàng. Mọi tab hiện hết, không cắt. */}
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                  <TabsTrigger value="timeline" className="w-full text-xs">{t("contract.tabs.timeline")}</TabsTrigger>
                  <TabsTrigger value="disbursements" className="w-full text-xs">{t("contract.tabs.disbursements")}</TabsTrigger>
                  <TabsTrigger value="deliverables" className="w-full text-xs">{t("contract.tabs.deliverables")}</TabsTrigger>
                  <TabsTrigger value="progress" className="w-full text-xs">{t("contract.tabs.progressReports")}</TabsTrigger>
                  <TabsTrigger value="final" className="w-full text-xs">{t("contract.tabs.finalReport")}</TabsTrigger>
                  <TabsTrigger value="amendments" className="w-full text-xs">{t("contract.tabs.amendments")}</TabsTrigger>
                  <TabsTrigger value="settlement" className="w-full text-xs">{t("contract.tabs.settlement")}</TabsTrigger>
                </TabsList>
                <TabsContent value="timeline">
                  <ContractMilestoneTimeline contract={contract} />
                </TabsContent>
                <TabsContent value="disbursements">
                  <DisbursementsPanel contractId={contract.id} canManage={canManage} />
                </TabsContent>
                <TabsContent value="deliverables">
                  <DeliverablesPanel contractId={contract.id} canManage={canManage} />
                </TabsContent>
                <TabsContent value="progress">
                  <ProgressReportsPanel
                    contractId={contract.id}
                    contractStartDate={contract.startDate}
                    contractEndDate={contract.endDate}
                  />
                </TabsContent>
                <TabsContent value="final">
                  <FinalReportPanel contractId={contract.id} canManage={canManage} />
                </TabsContent>
                <TabsContent value="amendments">
                  <AmendmentsPanel contractId={contract.id} canManage={canManage} />
                </TabsContent>
                <TabsContent value="settlement">
                  <SettlementPanel contractId={contract.id} canManage={canManage} />
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
