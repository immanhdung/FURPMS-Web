import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  FileSignature,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Timer,
  Banknote,
} from "lucide-react";
import { api } from "../api/axios";
import { StatusBadge } from "../components/shared/StatusBadge";
import { InfoBlock } from "../components/shared/InfoBlock";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingState } from "../components/shared/LoadingState";
import { FilterPills } from "../components/shared/FilterPills";

// ────────────────────────────────────────────────────────────────────────
// Status mappings
// ────────────────────────────────────────────────────────────────────────
const CONTRACT_STATUS = {
  PENDING_SIGNATURE: { label: "Chờ ký",         color: "bg-yellow-100 text-yellow-700", icon: Clock },
  ACTIVE:            { label: "Đang thực hiện",  color: "bg-green-100 text-green-700",   icon: CheckCircle2 },
  EXTENDED:          { label: "Gia hạn",         color: "bg-blue-100 text-blue-700",     icon: Timer },
  COMPLETED:         { label: "Hoàn thành",      color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  TERMINATED:        { label: "Chấm dứt",        color: "bg-red-100 text-red-700",       icon: XCircle },
};

const DISBURSEMENT_STATUS = {
  PENDING:       { label: "Chờ xử lý",    color: "bg-gray-100 text-gray-600" },
  CONDITION_MET: { label: "Đủ điều kiện",  color: "bg-blue-100 text-blue-700" },
  PROCESSING:    { label: "Đang xử lý",    color: "bg-amber-100 text-amber-700" },
  DISBURSED:     { label: "Đã giải ngân",  color: "bg-green-100 text-green-700" },
  FAILED:        { label: "Thất bại",       color: "bg-red-100 text-red-700" },
};

const STATUS_OPTIONS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING_SIGNATURE", label: "Chờ ký" },
  { key: "ACTIVE", label: "Đang thực hiện" },
  { key: "EXTENDED", label: "Gia hạn" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "TERMINATED", label: "Chấm dứt" },
];

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";

// ────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────

function ContractCard({ contract, onOpen }) {
  const disbursedPct = contract.totalBudget > 0 ? Math.round((contract.disbursed / contract.totalBudget) * 100) : 0;
  return (
    <Card
      className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onOpen(contract)}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết hợp đồng: ${contract.contractNumber}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(contract); } }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <FileSignature size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
              <span className="text-xs font-mono text-muted-foreground">{contract.contractNumber}</span>
              <StatusBadge status={contract.status} statusMap={CONTRACT_STATUS} />
            </div>
            <h3 className="font-semibold text-foreground line-clamp-1">{contract.proposalTitle}</h3>
            <p className="text-sm text-muted-foreground mt-1">PI: {contract.piName}</p>
          </div>

          {/* Right metrics */}
          <div className="flex gap-4 sm:gap-6 flex-shrink-0 flex-wrap">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Kinh phí</p>
              <p className="text-lg font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(contract.totalBudget)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Giải ngân</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 bg-surface-variant rounded-full h-2" aria-hidden="true">
                  <div className="bg-tertiary h-2 rounded-full" style={{ width: `${disbursedPct}%` }} />
                </div>
                <span className="text-sm font-semibold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{disbursedPct}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Sản phẩm</p>
              <p className="text-lg font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{contract.deliverablesSubmitted}/{contract.deliverablesTotal}</p>
            </div>
          </div>
        </div>

        {/* Timeline bar */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground flex-wrap">
          <Calendar size={12} aria-hidden="true" />
          <span>{formatDate(contract.startDate)} → {formatDate(contract.endDate)}</span>
          <span className="mx-1 hidden sm:inline">•</span>
          <span>{contract.progressReportsCount} báo cáo tiến độ</span>
        </div>
      </div>
    </Card>
  );
}

function ContractDetailDialog({ open, onOpenChange, contract }) {
  const [activeTab, setActiveTab] = useState("overview");

  React.useEffect(() => {
    if (open) setActiveTab("overview");
  }, [open]);

  if (!contract) return null;

  const TABS = [
    { key: "overview", label: "Tổng quan" },
    { key: "disbursements", label: "Giải ngân" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground pr-8" style={{ textWrap: "balance" }}>
            {contract.contractNumber} — {contract.proposalTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border" role="tablist" aria-label="Chi tiết hợp đồng">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`contract-panel-${tab.key}`}
                className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-md -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeTab === tab.key
                    ? "border-b-2 border-primary text-primary bg-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm" role="tabpanel" id="contract-panel-overview">
              <InfoBlock label="Trạng thái"><StatusBadge status={contract.status} statusMap={CONTRACT_STATUS} /></InfoBlock>
              <InfoBlock label="Phương thức tài trợ" value={contract.fundingMethod} />
              <InfoBlock label="PI" value={`${contract.piName} (${contract.piEmail})`} />
              <InfoBlock label="Đại diện bên A" value={contract.sideARepresentative} />
              <InfoBlock label="Thời gian" value={`${formatDate(contract.startDate)} → ${formatDate(contract.endDate)}`} />
              <InfoBlock label="Gia hạn tối đa" value={`${contract.maxExtensionMonths} tháng`} />
              <InfoBlock label="Tổng kinh phí" value={formatCurrency(contract.totalBudget)} />
              <InfoBlock label="Đã giải ngân" value={formatCurrency(contract.disbursed)} />
            </div>
          )}

          {activeTab === "disbursements" && (
            <div role="tabpanel" id="contract-panel-disbursements">
              {contract.disbursements?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Đợt</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Dự kiến</TableHead>
                        <TableHead>Thực tế</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Mã GD</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contract.disbursements.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">Đợt {d.phase}</TableCell>
                          <TableCell className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(d.amount)}</TableCell>
                          <TableCell>{formatDate(d.scheduledDate)}</TableCell>
                          <TableCell>{formatDate(d.actualDate)}</TableCell>
                          <TableCell>
                            <StatusBadge status={d.status} statusMap={DISBURSEMENT_STATUS} />
                          </TableCell>
                          <TableCell className="font-mono text-xs">{d.bankReference || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState icon={Banknote} title="Chưa có lịch giải ngân" />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────
export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedContract, setSelectedContract] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (statusFilter !== "ALL") params.status = statusFilter;
        const res = await api.get("/contracts", { params });
        if (res.data.success) setContracts(res.data.data);
      } catch (err) {
        console.error("Failed to fetch contracts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [statusFilter]);

  const openDetail = (contract) => {
    setSelectedContract(contract);
    setDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 motion-reduce:animate-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ textWrap: "balance" }}>Quản lý Hợp đồng</h1>
        <p className="text-sm text-muted-foreground mt-1">Theo dõi hợp đồng nghiên cứu, giải ngân và sản phẩm.</p>
      </div>

      {/* Status Filters */}
      <FilterPills
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
        showIcon={false}
      />

      {/* Contract Cards */}
      {loading ? (
        <LoadingState message="Đang tải hợp đồng…" />
      ) : contracts.length === 0 ? (
        <EmptyState icon={FileSignature} title="Không có hợp đồng nào" description="Khi hợp đồng nghiên cứu được tạo, chúng sẽ hiển thị tại đây." />
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} onOpen={openDetail} />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <ContractDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contract={selectedContract}
      />
    </div>
  );
}
