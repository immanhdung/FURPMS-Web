import React, { useEffect, useState, useMemo } from "react";
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
  Filter,
  PlusCircle,
  MoreVertical,
  Eye,
  Users,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Loader2,
} from "lucide-react";
import { api } from "../api/axios";

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

const StatusBadge = ({ status }) => {
  const info = STATUS_MAP[status] || { label: status, color: "bg-gray-100 text-gray-700", icon: FileText };
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${info.color}`}>
      <Icon size={12} /> {info.label}
    </span>
  );
};

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
  const [activeDetailTab, setActiveDetailTab] = useState("overview");

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
    setActiveDetailTab("overview");
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

  // ── Helpers ──────────────────────────────────────────────────────────
  const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";

  const statusOptions = ["ALL", "DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED", "WITHDRAWN", "IN_PROGRESS"];

  // ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Đề xuất Nghiên cứu</h1>
          <p className="text-sm text-muted-foreground mt-1">Xem, lọc và quản lý tất cả đề xuất của bạn.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Tạo Đề xuất mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên đề tài, chủ nhiệm..."
              className="pl-10 bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-container text-muted-foreground hover:bg-surface-container-high"
                }`}
              >
                {s === "ALL" ? "Tất cả" : (STATUS_MAP[s]?.label || s)}
              </button>
            ))}
          </div>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : proposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Không tìm thấy đề xuất nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((p) => (
                  <TableRow key={p.id} className="hover:bg-surface-variant/30 transition-colors cursor-pointer" onClick={() => openDetail(p)}>
                    <TableCell>
                      <p className="font-semibold text-foreground line-clamp-1">{p.titleVI}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.titleEN}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{p.piName}</p>
                      <p className="text-xs text-muted-foreground">{p.hostingUnit}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="font-medium text-foreground whitespace-nowrap">
                      {formatCurrency(p.totalBudget)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 bg-surface-variant rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{p.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={(e) => { e.stopPropagation(); openDetail(p); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-surface/50">
            <span className="text-sm text-muted-foreground">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} kết quả
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchProposals(pagination.page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchProposals(pagination.page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Detail Dialog ────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground pr-8">
              {selectedProposal?.titleVI || "Chi tiết đề xuất"}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedProposal ? (
            <div className="flex flex-col gap-6 mt-2">
              {/* Status + Quick Info */}
              <div className="flex flex-wrap items-center gap-4">
                <StatusBadge status={selectedProposal.status} />
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} /> {formatDate(selectedProposal.plannedStartDate)} — {formatDate(selectedProposal.plannedEndDate)}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign size={12} /> {formatCurrency(selectedProposal.totalBudget)}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Users size={12} /> {selectedProposal.teamMemberCount || selectedProposal.teamMembers?.length || 0} thành viên</span>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-border">
                {[
                  { key: "overview", label: "Tổng quan" },
                  { key: "team", label: "Nhóm nghiên cứu" },
                  { key: "budget", label: "Ngân sách" },
                  { key: "rounds", label: "Vòng xét duyệt" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveDetailTab(tab.key)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-md -mb-px ${
                      activeDetailTab === tab.key
                        ? "border-b-2 border-primary text-primary bg-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeDetailTab === "overview" && (
                  <div className="space-y-4 text-sm">
                    <InfoBlock label="Tên tiếng Anh" value={selectedProposal.titleEN} />
                    <InfoBlock label="Chủ nhiệm" value={`${selectedProposal.piName} (${selectedProposal.piEmail})`} />
                    <InfoBlock label="Đơn vị chủ trì" value={selectedProposal.hostingUnit} />
                    <InfoBlock label="Thời gian" value={`${selectedProposal.durationMonths} tháng`} />
                    <InfoBlock label="Phương thức tài trợ" value={selectedProposal.fundingMethod} />
                    {selectedProposal.abstractVI && <InfoBlock label="Tóm tắt" value={selectedProposal.abstractVI} />}
                    {selectedProposal.researchObjectives && <InfoBlock label="Mục tiêu nghiên cứu" value={selectedProposal.researchObjectives} />}
                    {selectedProposal.noveltyOriginality && <InfoBlock label="Tính mới / Sáng tạo" value={selectedProposal.noveltyOriginality} />}
                  </div>
                )}

                {activeDetailTab === "team" && (
                  <div>
                    {selectedProposal.teamMembers?.length > 0 ? (
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
                          {selectedProposal.teamMembers.map((m) => (
                            <TableRow key={m.id}>
                              <TableCell>
                                <span className="font-medium">{m.fullName}</span>
                                {m.isPi && <Badge variant="outline" className="ml-2 text-primary border-primary text-[10px]">PI</Badge>}
                                {m.isSecretary && <Badge variant="outline" className="ml-1 text-[10px]">Thư ký</Badge>}
                              </TableCell>
                              <TableCell className="text-sm">{m.roleType}</TableCell>
                              <TableCell className="text-sm">{m.unitName}</TableCell>
                              <TableCell className="text-sm">{m.workMonths}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Chưa có thông tin nhóm nghiên cứu.</p>
                    )}
                  </div>
                )}

                {activeDetailTab === "budget" && (
                  <div>
                    {selectedProposal.budgetSummary ? (
                      <div className="space-y-4">
                        <div className="text-lg font-bold text-foreground">
                          Tổng: {formatCurrency(selectedProposal.budgetSummary.totalAmount)}
                        </div>
                        <div className="space-y-3">
                          {selectedProposal.budgetSummary.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <span className="text-sm text-foreground flex-1">{item.categoryName}</span>
                              <span className="text-sm font-medium text-foreground w-36 text-right">{formatCurrency(item.amount)}</span>
                              <div className="w-32">
                                <div className="bg-surface-variant rounded-full h-2">
                                  <div className="bg-tertiary h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground w-12 text-right">{item.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Chưa có thông tin ngân sách.</p>
                    )}
                  </div>
                )}

                {activeDetailTab === "rounds" && (
                  <div>
                    {selectedProposal.rounds?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProposal.rounds.map((r) => (
                          <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-surface-container-low">
                            <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center font-bold text-sm">
                              V{r.roundNumber}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">Vòng {r.roundNumber} — {r.dimension}</p>
                              <p className="text-xs text-muted-foreground">{r.closedAt ? `Kết thúc: ${formatDate(r.closedAt)}` : "Đang mở"}</p>
                            </div>
                            <StatusBadge status={r.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Chưa có vòng xét duyệt.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Small helper component ─────────────────────────────────────────────
function InfoBlock({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-foreground whitespace-pre-line">{value}</dd>
    </div>
  );
}
