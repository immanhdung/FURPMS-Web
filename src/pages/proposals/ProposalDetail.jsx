import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProposal, useSubmitProposal, useWithdrawProposal, useGenerateAISummary } from "../../hooks/useProposals";
import { useAuthStore } from "../../store/authStore";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { LoadingState } from "../../components/shared/LoadingState";
import { EmptyState } from "../../components/shared/EmptyState";
import { InfoBlock } from "../../components/shared/InfoBlock";
import {
  ArrowLeft,
  Pencil,
  Send,
  Undo2,
  Download,
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Building2,
  GraduationCap,
} from "lucide-react";
import { formatCurrency, formatDate, formatRelativeTime, getStatusConfig } from "../../lib/utils";

// ────────────────────────────────────────────────────────────────────────
// Status icon map
// ────────────────────────────────────────────────────────────────────────
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

function ProposalStatusBadge({ status, size = "default" }) {
  const config = getStatusConfig("proposal", status);
  const Icon = STATUS_ICON_MAP[status];
  const sizeClass = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClass} font-semibold rounded-full whitespace-nowrap ${config.color}`}>
      {Icon && <Icon size={size === "lg" ? 16 : 12} aria-hidden="true" />} {config.label}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Tab: Overview
// ────────────────────────────────────────────────────────────────────────
function OverviewTab({ proposal }) {
  return (
    <div className="space-y-5 text-sm animate-in fade-in duration-200">
      <InfoBlock label="Tên tiếng Anh" value={proposal.titleEN} />
      <InfoBlock label="Chủ nhiệm" value={`${proposal.piName} (${proposal.piEmail || "—"})`} />
      <InfoBlock label="Đơn vị chủ trì" value={proposal.hostingUnit} />
      <InfoBlock label="Thời gian thực hiện" value={`${proposal.durationMonths || "—"} tháng`} />
      <InfoBlock label="Phương thức tài trợ" value={proposal.fundingMethod || "—"} />
      {proposal.abstractVI && <InfoBlock label="Tóm tắt" value={proposal.abstractVI} />}
      {proposal.researchObjectives && <InfoBlock label="Mục tiêu nghiên cứu" value={proposal.researchObjectives} />}
      {proposal.noveltyOriginality && <InfoBlock label="Tính mới / Sáng tạo" value={proposal.noveltyOriginality} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Tab: Team
// ────────────────────────────────────────────────────────────────────────
function TeamTab({ proposal }) {
  if (!proposal.teamMembers?.length) {
    return <EmptyState title="Chưa có thông tin nhóm nghiên cứu" />;
  }
  return (
    <div className="animate-in fade-in duration-200">
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
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Tab: Budget
// ────────────────────────────────────────────────────────────────────────
function BudgetTab({ proposal }) {
  if (!proposal.budgetSummary) {
    return <EmptyState title="Chưa có thông tin ngân sách" />;
  }
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
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

// ────────────────────────────────────────────────────────────────────────
// Tab: Rounds
// ────────────────────────────────────────────────────────────────────────
function RoundsTab({ proposal }) {
  if (!proposal.rounds?.length) {
    return <EmptyState title="Chưa có vòng xét duyệt" />;
  }
  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {proposal.rounds.map((r) => {
        const roundConfig = getStatusConfig("reviewRound", r.status);
        return (
          <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-surface-container-low">
            <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center font-bold text-sm" aria-hidden="true">
              V{r.roundNumber}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">Vòng {r.roundNumber} — {r.dimension}</p>
              <p className="text-xs text-muted-foreground">{r.closedAt ? `Kết thúc: ${formatDate(r.closedAt)}` : "Đang mở"}</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${roundConfig.color}`}>
              {roundConfig.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Tab: Documents
// ────────────────────────────────────────────────────────────────────────
function DocumentsTab({ proposal }) {
  const docs = proposal.documents || [];
  if (!docs.length) {
    return <EmptyState title="Chưa có tài liệu đính kèm" />;
  }
  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {docs.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-container-low">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center" aria-hidden="true">
            <FileText size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{doc.fileName}</p>
            <p className="text-xs text-muted-foreground">{doc.category || "Tài liệu"}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <a href={doc.fileUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label={`Tải ${doc.fileName}`}>
              <Download size={14} className="mr-1" /> Tải về
            </a>
          </Button>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ────────────────────────────────────────────────────────────────────────
function ProposalDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-10 w-full bg-muted rounded" />
          <div className="h-48 w-full bg-muted rounded-xl" />
          <div className="h-32 w-full bg-muted rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 w-full bg-muted rounded-xl" />
          <div className="h-32 w-full bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────
export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hasRole = useAuthStore((s) => s.hasRole);

  const { data: proposal, isLoading, isError, error } = useProposal(id);

  // Mutations
  const submitMutation = useSubmitProposal();
  const withdrawMutation = useWithdrawProposal();
  const aiSummaryMutation = useGenerateAISummary();

  // Tabs state
  const [activeTab, setActiveTab] = useState("overview");
  const TABS = [
    { key: "overview", label: "Tổng quan" },
    { key: "team", label: "Nhóm nghiên cứu" },
    { key: "budget", label: "Ngân sách" },
    { key: "rounds", label: "Vòng xét duyệt" },
    { key: "documents", label: "Tài liệu" },
  ];

  const handleSubmit = async () => {
    if (window.confirm("Bạn có chắc chắn muốn nộp đề xuất này?")) {
      try {
        await submitMutation.mutateAsync(id);
      } catch (err) {
        console.error("Submit failed:", err);
      }
    }
  };

  const handleWithdraw = async () => {
    if (window.confirm("Bạn có chắc chắn muốn rút đề xuất về bản nháp?")) {
      try {
        await withdrawMutation.mutateAsync(id);
      } catch (err) {
        console.error("Withdraw failed:", err);
      }
    }
  };

  const handleGenerateAISummary = async () => {
    try {
      const result = await aiSummaryMutation.mutateAsync(id);
      alert(`Tóm tắt AI:\n\n${result?.summary || "Đã tạo tóm tắt thành công."}`);
    } catch (err) {
      console.error("AI Summary failed:", err);
    }
  };

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 animate-in fade-in">
        <ProposalDetailSkeleton />
      </div>
    );
  }

  // ── Error State ──
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <EmptyState
          icon={AlertTriangle}
          title="Không tìm thấy đề xuất"
          description={error?.message || `Đề xuất với ID "${id}" không tồn tại hoặc bạn không có quyền truy cập.`}
          actionLabel="Quay lại danh sách"
          onAction={() => navigate("/proposals")}
        />
      </div>
    );
  }

  if (!proposal) return null;

  const canEdit = proposal.status === "DRAFT" || proposal.status === "REVISION_REQUESTED";
  const canSubmit = proposal.status === "DRAFT";
  const canWithdraw = proposal.status === "SUBMITTED";

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6 animate-in fade-in duration-300">
      {/* Back button + Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-1 text-muted-foreground shrink-0" onClick={() => navigate("/proposals")} aria-label="Quay lại danh sách">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ textWrap: "balance" }}>{proposal.titleVI}</h1>
            {proposal.titleEN && <p className="text-sm text-muted-foreground mt-1">{proposal.titleEN}</p>}
          </div>
        </div>
        <ProposalStatusBadge status={proposal.status} size="lg" />
      </div>

      {/* Revision Note Banner */}
      {proposal.status === "REVISION_REQUESTED" && proposal.revisionNote && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg flex items-start gap-2" role="alert">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Yêu cầu chỉnh sửa từ Hội đồng:</p>
            <p className="text-sm mt-1">{proposal.revisionNote}</p>
          </div>
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Tabs ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Buttons */}
          <div className="flex gap-1 border-b border-border overflow-x-auto" role="tablist" aria-label="Chi tiết đề xuất">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`panel-${tab.key}`}
                className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-md -mb-px whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 min-h-[250px]" role="tabpanel" id={`panel-${activeTab}`}>
              {activeTab === "overview" && <OverviewTab proposal={proposal} />}
              {activeTab === "team" && <TeamTab proposal={proposal} />}
              {activeTab === "budget" && <BudgetTab proposal={proposal} />}
              {activeTab === "rounds" && <RoundsTab proposal={proposal} />}
              {activeTab === "documents" && <DocumentsTab proposal={proposal} />}
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Info + Actions ── */}
        <div className="space-y-4">
          {/* Quick Info Card */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Thông tin nhanh</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <GraduationCap size={16} className="shrink-0" aria-hidden="true" />
                  <div>
                    <span className="block text-xs text-muted-foreground">Chủ nhiệm</span>
                    <span className="font-medium text-foreground">{proposal.piName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Building2 size={16} className="shrink-0" aria-hidden="true" />
                  <div>
                    <span className="block text-xs text-muted-foreground">Đơn vị chủ trì</span>
                    <span className="font-medium text-foreground">{proposal.hostingUnit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar size={16} className="shrink-0" aria-hidden="true" />
                  <div>
                    <span className="block text-xs text-muted-foreground">Thời gian</span>
                    <span className="font-medium text-foreground">{formatDate(proposal.plannedStartDate)} — {formatDate(proposal.plannedEndDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <DollarSign size={16} className="shrink-0" aria-hidden="true" />
                  <div>
                    <span className="block text-xs text-muted-foreground">Tổng kinh phí</span>
                    <span className="font-medium text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(proposal.totalBudget)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Users size={16} className="shrink-0" aria-hidden="true" />
                  <div>
                    <span className="block text-xs text-muted-foreground">Thành viên</span>
                    <span className="font-medium text-foreground">{proposal.teamMemberCount || proposal.teamMembers?.length || 0} người</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Thao tác</h3>

              {canEdit && (
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to={`/proposals/${id}/edit`}>
                    <Pencil size={16} className="mr-2" aria-hidden="true" />
                    {proposal.status === "REVISION_REQUESTED" ? "Chỉnh sửa & Nộp lại" : "Chỉnh sửa đề xuất"}
                  </Link>
                </Button>
              )}

              {canSubmit && (
                <Button
                  className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send size={16} className="mr-2" aria-hidden="true" />
                  )}
                  Nộp đề xuất
                </Button>
              )}

              {canWithdraw && (
                <Button
                  className="w-full justify-start text-amber-700 border-amber-200 hover:bg-amber-50"
                  variant="outline"
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                >
                  <Undo2 size={16} className="mr-2" aria-hidden="true" />
                  Rút về bản nháp
                </Button>
              )}

              {/* Export button */}
              <Button className="w-full justify-start" variant="outline" onClick={() => alert("Chức năng xuất file BM01 sẽ được kết nối API /proposals/{id}/export/scientific")}>
                <Download size={16} className="mr-2" aria-hidden="true" />
                Xuất BM01 (Word)
              </Button>
            </CardContent>
          </Card>

          {/* AI Insight Card */}
          <Card className="border-border shadow-sm bg-gradient-to-br from-violet-50/50 to-blue-50/50">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" aria-hidden="true" />
                AI Insight
              </h3>
              <p className="text-xs text-muted-foreground">
                Tạo bản tóm tắt AI để đánh giá nhanh tính khả thi và điểm mạnh của đề xuất.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-violet-600 border-violet-200 hover:bg-violet-50"
                onClick={handleGenerateAISummary}
                disabled={aiSummaryMutation.isPending}
              >
                {aiSummaryMutation.isPending ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Sparkles size={14} className="mr-2" aria-hidden="true" />
                )}
                Tạo tóm tắt AI
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
