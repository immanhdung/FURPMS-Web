import React, { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  Pencil,
  Send,
  Undo2,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useProposals, useSubmitProposal, useWithdrawProposal } from "../hooks/useProposals";
import { useAuthStore } from "../store/authStore";
import { LoadingState } from "../components/shared/LoadingState";
import { EmptyState } from "../components/shared/EmptyState";
import { FilterPills } from "../components/shared/FilterPills";
import { Pagination } from "../components/shared/Pagination";
import { formatCurrency, formatDate, getStatusConfig } from "../lib/utils";

// ────────────────────────────────────────────────────────────────────────
// Status filter options
// ────────────────────────────────────────────────────────────────────────
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

// Status icon map for StatusBadge rendering
const STATUS_ICON_MAP = {
  DRAFT: FileText,
  SUBMITTED: Send,
  UNDER_REVIEW: Clock,
  REVISION_REQUESTED: AlertTriangle,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  WITHDRAWN: XCircle,
  IN_PROGRESS: Loader2,
};

// ────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────

function ProposalStatusBadge({ status }) {
  const config = getStatusConfig("proposal", status);
  const Icon = STATUS_ICON_MAP[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${config.color}`}>
      {Icon && <Icon size={12} aria-hidden="true" />} {config.label}
    </span>
  );
}

function ProposalActions({ proposal, onSubmit, onWithdraw }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const actions = [];

  if (proposal.status === "DRAFT") {
    actions.push({
      label: "Chỉnh sửa",
      icon: Pencil,
      onClick: () => navigate(`/proposals/${proposal.id}/edit`),
    });
    actions.push({
      label: "Nộp đề xuất",
      icon: Send,
      onClick: () => onSubmit(proposal.id),
      className: "text-primary",
    });
  }

  if (proposal.status === "SUBMITTED") {
    actions.push({
      label: "Rút về nháp",
      icon: Undo2,
      onClick: () => onWithdraw(proposal.id),
      className: "text-amber-600",
    });
  }

  if (proposal.status === "REVISION_REQUESTED") {
    actions.push({
      label: "Chỉnh sửa & Nộp lại",
      icon: Pencil,
      onClick: () => navigate(`/proposals/${proposal.id}/edit`),
      className: "text-orange-600",
    });
  }

  // Always show View action
  actions.push({
    label: "Xem chi tiết",
    icon: Eye,
    onClick: () => navigate(`/proposals/${proposal.id}`),
  });

  if (actions.length <= 2) {
    // Show inline buttons
    return (
      <div className="flex items-center gap-1 justify-end">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            size="sm"
            className={`text-xs ${action.className || "text-muted-foreground"}`}
            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
            aria-label={`${action.label}: ${proposal.titleVI}`}
          >
            <action.icon size={14} className="mr-1" aria-hidden="true" />
            {action.label}
          </Button>
        ))}
      </div>
    );
  }

  // Show dropdown for 3+ actions
  return (
    <div className="relative flex items-center justify-end">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        aria-label={`Thao tác cho ${proposal.titleVI}`}
        aria-expanded={showMenu}
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </Button>

      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-150">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={(e) => { e.stopPropagation(); action.onClick(); setShowMenu(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors ${action.className || "text-foreground"}`}
              >
                <action.icon size={14} aria-hidden="true" />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProposalTableRow({ proposal, onSubmit, onWithdraw }) {
  const navigate = useNavigate();

  return (
    <TableRow
      className="hover:bg-surface-variant/30 transition-colors cursor-pointer"
      onClick={() => navigate(`/proposals/${proposal.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết: ${proposal.titleVI}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/proposals/${proposal.id}`); } }}
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
        <ProposalStatusBadge status={proposal.status} />
      </TableCell>
      <TableCell className="font-medium text-foreground whitespace-nowrap" style={{ fontVariantNumeric: "tabular-nums" }}>
        {formatCurrency(proposal.totalBudget)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 bg-surface-variant rounded-full h-2" aria-hidden="true">
            <div className="bg-primary h-2 rounded-full transition-[width] duration-300" style={{ width: `${proposal.progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-muted-foreground w-8 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{proposal.progress}%</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <ProposalActions proposal={proposal} onSubmit={onSubmit} onWithdraw={onWithdraw} />
      </TableCell>
    </TableRow>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────
export default function ProposalsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  // Build filters for React Query hook
  const filters = {
    page,
    limit: 20,
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
  };

  // React Query: Fetch proposals
  const { data, isLoading, isError } = useProposals(filters);
  const proposals = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

  // Mutations
  const submitMutation = useSubmitProposal();
  const withdrawMutation = useWithdrawProposal();

  const handleSubmit = useCallback(async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn nộp đề xuất này?")) {
      try {
        await submitMutation.mutateAsync(id);
      } catch (err) {
        console.error("Submit failed:", err);
      }
    }
  }, [submitMutation]);

  const handleWithdraw = useCallback(async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn rút đề xuất về bản nháp?")) {
      try {
        await withdrawMutation.mutateAsync(id);
      } catch (err) {
        console.error("Withdraw failed:", err);
      }
    }
  }, [withdrawMutation]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
  };

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1); // Reset to page 1 on filter change
  };

  // Show success toast if navigated back from Wizard submission
  const successMessage = location.state?.message;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 motion-reduce:animate-none">
      {/* Success Banner */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2" role="alert">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ textWrap: "balance" }}>Quản lý Đề xuất Nghiên cứu</h1>
          <p className="text-sm text-muted-foreground mt-1">Xem, lọc và quản lý tất cả đề xuất của bạn.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
          <Link to="/proposals/new">
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Tạo Đề xuất mới
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
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

          {/* Status filter pills */}
          <FilterPills
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatusChange}
          />
        </div>
      </Card>

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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <LoadingState message="Đang tải danh sách đề xuất…" />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={AlertTriangle}
                      title="Không thể tải dữ liệu"
                      description="Đã xảy ra lỗi khi tải danh sách đề xuất. Vui lòng thử lại."
                    />
                  </TableCell>
                </TableRow>
              ) : proposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={FileText}
                      title="Không tìm thấy đề xuất nào"
                      description={statusFilter !== "ALL"
                        ? `Không có đề xuất nào ở trạng thái "${STATUS_OPTIONS.find(s => s.key === statusFilter)?.label}".`
                        : "Bạn chưa có đề xuất nghiên cứu nào. Hãy tạo đề xuất mới để bắt đầu."}
                      actionLabel="Tạo Đề xuất mới"
                      onAction={() => navigate("/proposals/new")}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((p) => (
                  <ProposalTableRow
                    key={p.id}
                    proposal={p}
                    onSubmit={handleSubmit}
                    onWithdraw={handleWithdraw}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>
    </div>
  );
}
