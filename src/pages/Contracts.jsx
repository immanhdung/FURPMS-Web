import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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
  DollarSign,
  Eye,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Timer,
  Loader2,
  Banknote,
  Package,
} from "lucide-react";
import { api } from "../api/axios";

// ────────────────────────────────────────────────────────────────────────
// Status mappings
// ────────────────────────────────────────────────────────────────────────
const CONTRACT_STATUS = {
  PENDING_SIGNATURE: { label: "Chờ ký",      color: "bg-yellow-100 text-yellow-700", icon: Clock },
  ACTIVE:            { label: "Đang thực hiện", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  EXTENDED:          { label: "Gia hạn",      color: "bg-blue-100 text-blue-700",    icon: Timer },
  COMPLETED:         { label: "Hoàn thành",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  TERMINATED:        { label: "Chấm dứt",     color: "bg-red-100 text-red-700",       icon: XCircle },
};

const DISBURSEMENT_STATUS = {
  PENDING:       { label: "Chờ xử lý",      color: "bg-gray-100 text-gray-600" },
  CONDITION_MET: { label: "Đủ điều kiện",    color: "bg-blue-100 text-blue-700" },
  PROCESSING:    { label: "Đang xử lý",      color: "bg-amber-100 text-amber-700" },
  DISBURSED:     { label: "Đã giải ngân",    color: "bg-green-100 text-green-700" },
  FAILED:        { label: "Thất bại",         color: "bg-red-100 text-red-700" },
};

const StatusBadge = ({ status, map }) => {
  const info = map[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${info.color}`}>
      {Icon && <Icon size={12} />} {info.label}
    </span>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────
export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedContract, setSelectedContract] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchContracts = async () => {
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

  const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";

  const openDetail = (contract) => {
    setSelectedContract(contract);
    setActiveTab("overview");
    setDetailOpen(true);
  };

  const statusOptions = ["ALL", "PENDING_SIGNATURE", "ACTIVE", "EXTENDED", "COMPLETED", "TERMINATED"];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý Hợp đồng</h1>
        <p className="text-sm text-muted-foreground mt-1">Theo dõi hợp đồng nghiên cứu, giải ngân và sản phẩm.</p>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setLoading(true); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface-container text-muted-foreground hover:bg-surface-container-high"
            }`}
          >
            {s === "ALL" ? "Tất cả" : (CONTRACT_STATUS[s]?.label || s)}
          </button>
        ))}
      </div>

      {/* Contract Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải...
        </div>
      ) : contracts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Không có hợp đồng nào.</p>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const disbursedPct = contract.totalBudget > 0 ? Math.round((contract.disbursed / contract.totalBudget) * 100) : 0;
            return (
              <Card key={contract.id} className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(contract)}>
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FileSignature size={18} className="text-primary flex-shrink-0" />
                        <span className="text-xs font-mono text-muted-foreground">{contract.contractNumber}</span>
                        <StatusBadge status={contract.status} map={CONTRACT_STATUS} />
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-1">{contract.proposalTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1">PI: {contract.piName}</p>
                    </div>

                    {/* Right metrics */}
                    <div className="flex gap-6 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Kinh phí</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(contract.totalBudget)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Giải ngân</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 bg-surface-variant rounded-full h-2">
                            <div className="bg-tertiary h-2 rounded-full" style={{ width: `${disbursedPct}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-foreground">{disbursedPct}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Sản phẩm</p>
                        <p className="text-lg font-bold text-foreground">{contract.deliverablesSubmitted}/{contract.deliverablesTotal}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline bar */}
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>{formatDate(contract.startDate)} → {formatDate(contract.endDate)}</span>
                    <span className="mx-2">•</span>
                    <span>{contract.progressReportsCount} báo cáo tiến độ</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground pr-8">
              {selectedContract?.contractNumber} — {selectedContract?.proposalTitle}
            </DialogTitle>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-6 mt-2">
              {/* Tabs */}
              <div className="flex gap-1 border-b border-border">
                {[
                  { key: "overview", label: "Tổng quan" },
                  { key: "disbursements", label: "Giải ngân" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-md -mb-px ${
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoBlock label="Trạng thái"><StatusBadge status={selectedContract.status} map={CONTRACT_STATUS} /></InfoBlock>
                  <InfoBlock label="Phương thức tài trợ" value={selectedContract.fundingMethod} />
                  <InfoBlock label="PI" value={`${selectedContract.piName} (${selectedContract.piEmail})`} />
                  <InfoBlock label="Đại diện bên A" value={selectedContract.sideARepresentative} />
                  <InfoBlock label="Thời gian" value={`${formatDate(selectedContract.startDate)} → ${formatDate(selectedContract.endDate)}`} />
                  <InfoBlock label="Gia hạn tối đa" value={`${selectedContract.maxExtensionMonths} tháng`} />
                  <InfoBlock label="Tổng kinh phí" value={formatCurrency(selectedContract.totalBudget)} />
                  <InfoBlock label="Đã giải ngân" value={formatCurrency(selectedContract.disbursed)} />
                </div>
              )}

              {activeTab === "disbursements" && (
                <div>
                  {selectedContract.disbursements?.length > 0 ? (
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
                        {selectedContract.disbursements.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">Đợt {d.phase}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(d.amount)}</TableCell>
                            <TableCell>{formatDate(d.scheduledDate)}</TableCell>
                            <TableCell>{formatDate(d.actualDate)}</TableCell>
                            <TableCell>
                              <StatusBadge status={d.status} map={DISBURSEMENT_STATUS} />
                            </TableCell>
                            <TableCell className="font-mono text-xs">{d.bankReference || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Chưa có lịch giải ngân.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────
function InfoBlock({ label, value, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-foreground">{children || value || "—"}</dd>
    </div>
  );
}
