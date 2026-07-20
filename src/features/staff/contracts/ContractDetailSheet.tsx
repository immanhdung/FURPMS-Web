import { FileSignature } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContractQuery, useSignContractMutation } from "@/hooks/useContracts";
import { useProposalQuery } from "@/hooks/useProposals";
import { ProgressReportsPanel } from "@/features/staff/contracts/ProgressReportsPanel";
import { DisbursementsPanel } from "@/features/staff/contracts/DisbursementsPanel";
import { DeliverablesPanel } from "@/features/staff/contracts/DeliverablesPanel";
import { FinalReportPanel } from "@/features/staff/contracts/FinalReportPanel";
import { AmendmentsPanel } from "@/features/staff/contracts/AmendmentsPanel";
import { SettlementPanel } from "@/features/staff/contracts/SettlementPanel";
import { useAuthStore } from "@/store/auth.store";
import { ROLES } from "@/constants/roles";
import { formatDate } from "@/utils/format";

interface ContractDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
}

export function ContractDetailSheet({ open, onOpenChange, contractId }: ContractDetailSheetProps) {
  const { data: contract, isLoading } = useContractQuery(contractId);
  const { data: proposal } = useProposalQuery(contract?.proposalId ?? null);
  const signMutation = useSignContractMutation();
  // Chỉ Admin/Staff được sinh lịch & xác nhận chi tiền; PI chỉ xem (BE cũng chặn 403).
  const canManage = useAuthStore((state) => {
    const roles = state.user?.roles ?? [];
    return roles.includes(ROLES.ADMIN) || roles.includes(ROLES.STAFF);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent resizable defaultWidth={640} className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{contract?.contractNumber || contract?.scopeTitle || "Contract"}</SheetTitle>
          <SheetDescription>{proposal?.titleEN || proposal?.titleVI || "Loading proposal..."}</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <PageLoader label="Loading contract..." />
        ) : !contract ? null : (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-5 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                {contract.status && <StatusBadge status={contract.status} />}
                <span className="text-xs text-muted-foreground">
                  {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                </span>
                {contract.maxExtensionMonths != null && (
                  <span className="text-xs text-muted-foreground">
                    Max extension: {contract.maxExtensionMonths}mo
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Side A representative</p>
                  <p className="mt-0.5 text-sm text-foreground">{contract.sideARepresentative ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">E-contract</p>
                  {contract.econtractUrl ? (
                    <a
                      href={contract.econtractUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block text-sm text-primary hover:underline"
                    >
                      {contract.econtractUrl}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-foreground">-</p>
                  )}
                </div>
              </div>

              <Button size="sm" onClick={() => contractId && signMutation.mutate(contractId)} disabled={signMutation.isPending}>
                <FileSignature />
                Sign contract
              </Button>

              {/* Thứ tự tab theo đúng dòng đời hợp đồng: tiền → sản phẩm → báo cáo → tổng kết → điều chỉnh → chốt sổ */}
              <Tabs defaultValue="disbursements">
                <TabsList className="flex-wrap">
                  <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
                  <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                  <TabsTrigger value="progress">Progress Reports</TabsTrigger>
                  <TabsTrigger value="final">Final Report</TabsTrigger>
                  <TabsTrigger value="amendments">Amendments</TabsTrigger>
                  <TabsTrigger value="settlement">Settlement</TabsTrigger>
                </TabsList>
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
