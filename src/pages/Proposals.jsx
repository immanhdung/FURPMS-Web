import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  Search,
  PlusCircle,
  Eye,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Loader2,
} from "lucide-react";
import { api } from "../api/axios";
import { StatusBadge } from "../components/shared/StatusBadge";
import { InfoBlock } from "../components/shared/InfoBlock";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingState } from "../components/shared/LoadingState";
import { FilterPills } from "../components/shared/FilterPills";
import { Pagination } from "../components/shared/Pagination";

// ────────────────────────────────────────────────────────────────────────
// Status mapping — color + label
// ────────────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  DRAFT:              { label: "Bản nháp",       color: "bg-gray-100 text-gray-700",    icon: FileText },
  SUBMITTED:          { label: "Đã nộp",         color: "bg-blue-100 text-blue-700",    icon: Send },
  UNDER_REVIEW:       { label: "Đang xét duyệt", color: "bg-amber-100 text-amber-700",  icon: Clock },
  REVISION_REQUESTED: { label: "Yêu cầu chỉnh sửa", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  APPROVED:           { label: "Đã duyệt",      color: "bg-green-100 text-green-700",  icon: CheckCircle2 },
  REJECTED:           { label: "Từ chối",        color: "bg-red-100 text-red-700",      icon: XCircle },
  WITHDRAWN:          { label: "Đã rút",         color: "bg-gray-200 text-gray-500",    icon: XCircle },
  IN_PROGRESS:        { label: "Đang thực hiện", color: "bg-emerald-100 text-emerald-700", icon: Loader2 },
};

const STATUS_OPTIONS = [
  { key: "ALL", label: "Tất cả" },
  { key: "DRAFT", label: "Bản nháp" },
  { key: "SUBMITTED", label: "Đã nộp" },
  { key: "UNDER_REVIEW", label: "Đang xét duyệt" },
  { key: "REVISION_REQUESTED", label: "Yêu cầu chỉnh sửa" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "REJECTED", label: "Từ chối" },
  { key: "WITHDRAWN", label: "Đã rút" },
  { key: "IN_PROGRESS", label: "Đang thực hiện" },
];

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";

// ────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────

function ProposalFilters({ searchQuery, setSearchQuery, statusFilter, setStatusFilter, onSearch }) {
  return (
    <Card className="p-4 border-border shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <form onSubmit={onSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            name="search"
            autoComplete="off"
            placeholder="Tìm kiếm theo tên đề tài, chủ nhiệm…"
            aria-label="Tìm kiếm đề tài"
            className="pl-10 bg-background border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Status filter */}
        <FilterPills
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>
    </Card>
  );
}

function ProposalTableRow({ proposal, onOpen }) {
  return (
    <TableRow
      className="hover:bg-surface-variant/30 transition-colors cursor-pointer"
      onClick={() => onOpen(proposal)}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết: ${proposal.titleVI}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(proposal); } }}
    >
      <TableCell>
        <p className="font-semibold text-foreground line-clamp-1">{proposal.titleVI}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{proposal.titleEN}</p>
      </TableCell>
      <TableCell>
        <p className="text-sm font-medium text-foreground">{proposal.piName}</p>
        <p className="text-xs text-muted-foreground">{proposal.hostingUnit}</p>
      </TableCell>
      <TableCell>
        <StatusBadge status={proposal.status} statusMap={STATUS_MAP} />
      </TableCell>
      <TableCell className="font-medium text-foreground whitespace-nowrap" style={{ fontVariantNumeric: "tabular-nums" }}>
        {formatCurrency(proposal.totalBudget)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 bg-surface-variant rounded-full h-2" aria-hidden="true">
            <div className="bg-primary h-2 rounded-full transition-transform" style={{ width: `${proposal.progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-muted-foreground w-8 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{proposal.progress}%</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={(e) => { e.stopPropagation(); onOpen(proposal); }}
          aria-label={`Xem chi tiết ${proposal.titleVI}`}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function ProposalOverviewTab({ proposal }) {
  return (
    <div className="space-y-4 text-sm">
      <InfoBlock label="Tên tiếng Anh" value={proposal.titleEN} />
      <InfoBlock label="Chủ nhiệm" value={`${proposal.piName} (${proposal.piEmail})`} />
      <InfoBlock label="Đơn vị chủ trì" value={proposal.hostingUnit} />
      <InfoBlock label="Thời gian" value={`${proposal.durationMonths} tháng`} />
      <InfoBlock label="Phương thức tài trợ" value={proposal.fundingMethod} />
      {proposal.abstractVI && <InfoBlock label="Tóm tắt" value={proposal.abstractVI} />}
      {proposal.researchObjectives && <InfoBlock label="Mục tiêu nghiên cứu" value={proposal.researchObjectives} />}
      {proposal.noveltyOriginality && <InfoBlock label="Tính mới / Sáng tạo" value={proposal.noveltyOriginality} />}
    </div>
  );
}

function ProposalTeamTab({ proposal }) {
  if (!proposal.teamMembers?.length) {
    return <EmptyState title="Chưa có thông tin nhóm nghiên cứu" />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Họ tên</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Đơn vị</TableHead>
          <TableHead>Tháng làm việc</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposal.teamMembers.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <span className="font-medium">{m.fullName}</span>
              {m.isPi && <Badge variant="outline" className="ml-2 text-primary border-primary text-[10px]">PI</Badge>}
              {m.isSecretary && <Badge variant="outline" className="ml-1 text-[10px]">Thư ký</Badge>}
            </TableCell>
            <TableCell className="text-sm">{m.roleType}</TableCell>
            <TableCell className="text-sm">{m.unitName}</TableCell>
            <TableCell className="text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>{m.workMonths}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ProposalBudgetTab({ proposal }) {
  if (!proposal.budgetSummary) {
    return <EmptyState title="Chưa có thông tin ngân sách" />;
  }
  return (
    <div className="space-y-4">
      <div className="text-lg font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        Tổng: {formatCurrency(proposal.budgetSummary.totalAmount)}
      </div>
      <div className="space-y-3">
        {proposal.budgetSummary.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="text-sm text-foreground flex-1 min-w-0 truncate">{item.categoryName}</span>
            <span className="text-sm font-medium text-foreground w-36 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.amount)}</span>
            <div className="w-32" aria-hidden="true">
              <div className="bg-surface-variant rounded-full h-2">
                <div className="bg-tertiary h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
            <span className="text-xs text-muted-foreground w-12 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProposalRoundsTab({ proposal }) {
  if (!proposal.rounds?.length) {
    return <EmptyState title="Chưa có vòng xét duyệt" />;
  }
  return (
    <div className="space-y-3">
      {proposal.rounds.map((r) => (
        <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-surface-container-low">
          <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center font-bold text-sm" aria-hidden="true">
            V{r.roundNumber}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm">Vòng {r.roundNumber} — {r.dimension}</p>
            <p className="text-xs text-muted-foreground">{r.closedAt ? `Kết thúc: ${formatDate(r.closedAt)}` : "Đang mở"}</p>
          </div>
          <StatusBadge status={r.status} statusMap={STATUS_MAP} />
        </div>
      ))}
    </div>
  );
}

function ProposalDetailDialog({ open, onOpenChange, proposal, loading }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Reset tab when opening new proposal
  React.useEffect(() => {
    if (open) setActiveTab("overview");
  }, [open]);

  const TABS = [
    { key: "overview", label: "Tổng quan" },
    { key: "team", label: "Nhóm nghiên cứu" },
    { key: "budget", label: "Ngân sách" },
    { key: "rounds", label: "Vòng xét duyệt" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground pr-8" style={{ textWrap: "balance" }}>
            {proposal?.titleVI || "Chi tiết đề xuất"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <LoadingState message="Đang tải chi tiết…" />
        ) : proposal ? (
          <div className="flex flex-col gap-6 mt-2">
            {/* Status + Quick Info */}
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge status={proposal.status} statusMap={STATUS_MAP} />
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} aria-hidden="true" /> {formatDate(proposal.plannedStartDate)} — {formatDate(proposal.plannedEndDate)}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1" style={{ fontVariantNumeric: "tabular-nums" }}><DollarSign size={12} aria-hidden="true" /> {formatCurrency(proposal.totalBudget)}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Users size={12} aria-hidden="true" /> {proposal.teamMemberCount || proposal.teamMembers?.length || 0} thành viên</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border" role="tablist" aria-label="Chi tiết đề xuất">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`panel-${tab.key}`}
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

            {/* Tab Content */}
            <div className="min-h-[200px]" role="tabpanel" id={`panel-${activeTab}`}>
              {activeTab === "overview" && <ProposalOverviewTab proposal={proposal} />}
              {activeTab === "team" && <ProposalTeamTab proposal={proposal} />}
              {activeTab === "budget" && <ProposalBudgetTab proposal={proposal} />}
              {activeTab === "rounds" && <ProposalRoundsTab proposal={proposal} />}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────
export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Fetch proposals ──────────────────────────────────────────────────
  const fetchProposals = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get("/proposals", { params });
      if (res.data.success) {
        setProposals(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch proposals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProposals(1);
  };

  // ── Fetch detail ─────────────────────────────────────────────────────
  const openDetail = async (proposal) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/proposals/${proposal.id}`);
      if (res.data.success) {
        setSelectedProposal(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch proposal detail", err);
      setSelectedProposal(proposal); // fallback to list data
    } finally {
      setDetailLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 motion-reduce:animate-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ textWrap: "balance" }}>Quản lý Đề xuất Nghiên cứu</h1>
          <p className="text-sm text-muted-foreground mt-1">Xem, lọc và quản lý tất cả đề xuất của bạn.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Tạo Đề xuất mới
        </Button>
      </div>

      {/* Filters */}
      <ProposalFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onSearch={handleSearch}
      />

      {/* Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface/50">
                <TableHead className="font-semibold">Tên đề tài</TableHead>
                <TableHead className="font-semibold">Chủ nhiệm</TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="font-semibold">Kinh phí</TableHead>
                <TableHead className="font-semibold">Tiến độ</TableHead>
                <TableHead className="font-semibold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <LoadingState message="Đang tải…" />
                  </TableCell>
                </TableRow>
              ) : proposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState title="Không tìm thấy đề xuất nào phù hợp" />
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((p) => (
                  <ProposalTableRow key={p.id} proposal={p} onOpen={openDetail} />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination pagination={pagination} onPageChange={fetchProposals} />
      </Card>

      {/* Detail Dialog */}
      <ProposalDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        proposal={selectedProposal}
        loading={detailLoading}
      />
    </div>
  );
}
