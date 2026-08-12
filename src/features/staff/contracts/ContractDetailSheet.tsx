import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FileDown, FileSignature, Loader2 } from "lucide-react";
import { contractService } from "@/services/api/contract.service";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContractQuery } from "@/hooks/useContracts";
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
import { formatDate } from "@/utils/format";

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
          <SheetDescription>{proposal?.titleEN || proposal?.titleVI || t("contract.loadingProposal")}</SheetDescription>
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
                {canManage && contract.status !== "PENDING_SIGNATURE" && (
                  <Button size="sm" variant="outline" onClick={handleExportSettlement} disabled={exportingSettlement}>
                    {exportingSettlement ? <Loader2 className="animate-spin" /> : <FileDown />}
                    {t("contract.exportSettlementWord")}
                  </Button>
                )}
              </div>

              {canManage && <ContractSignedDocs contractId={contract.id} />}

      <SignContractDialog open={signOpen} onOpenChange={setSignOpen} contractId={contractId} />

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
                  <ProgressReportsPanel contractId={contract.id} />
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
