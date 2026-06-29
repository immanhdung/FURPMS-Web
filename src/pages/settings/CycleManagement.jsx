import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FilterPills } from "../../components/shared/FilterPills";
import { EmptyState } from "../../components/shared/EmptyState";
import { LoadingState } from "../../components/shared/LoadingState";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import {
  useCycles,
  useOpenCycle,
  useStartReviewCycle,
  useCloseCycle,
  useArchiveCycle,
} from "../../hooks/useCycles";
import { formatCurrency, formatDate } from "../../lib/utils";
import {
  Plus,
  Calendar,
  FileText,
  TrendingUp,
  Play,
  CheckCircle,
  Archive,
  Pencil,
  Clock,
  Layers,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────
// State Machine Configurations
// ────────────────────────────────────────────────────────────────────────

const CYCLE_STATUS_MAP = {
  PLANNING: { label: "Đang lên kế hoạch", color: "bg-gray-100 text-gray-700" },
  OPEN: { label: "Đang mở", color: "bg-blue-100 text-blue-700" },
  REVIEWING: { label: "Đang xét duyệt", color: "bg-orange-100 text-orange-700" },
  CLOSED: { label: "Đã đóng", color: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Lưu trữ", color: "bg-zinc-100 text-zinc-700" },
};

const CYCLE_FILTERS = [
  { id: "ALL", label: "Tất cả" },
  { id: "PLANNING", label: "Đang lên kế hoạch" },
  { id: "OPEN", label: "Đang mở" },
  { id: "REVIEWING", label: "Đang xét duyệt" },
  { id: "CLOSED", label: "Đã đóng" },
  { id: "ARCHIVED", label: "Lưu trữ" },
];

const TRANSITIONS = {
  open: {
    title: "Mở nhận hồ sơ?",
    description: "Chu kỳ sẽ chuyển sang trạng thái OPEN. Giảng viên sẽ có thể bắt đầu nộp đề xuất. Hành động này không thể hoàn tác về PLANNING.",
    btnLabel: "Mở đợt tài trợ",
    variant: "warning",
    icon: Play,
  },
  startReview: {
    title: "Bắt đầu xét duyệt?",
    description: "Chu kỳ sẽ khóa nhận hồ sơ mới và chuyển sang giai đoạn REVIEWING. Các Hội đồng có thể bắt đầu làm việc.",
    btnLabel: "Bắt đầu xét duyệt",
    variant: "warning",
    icon: CheckCircle,
  },
  close: {
    title: "Đóng chu kỳ?",
    description: "Tất cả các hoạt động của chu kỳ này sẽ kết thúc. Không thể thêm đề xuất hay thay đổi trạng thái sau khi đóng.",
    btnLabel: "Đóng chu kỳ",
    variant: "danger",
    icon: Archive,
  },
  archive: {
    title: "Lưu trữ chu kỳ?",
    description: "Chu kỳ sẽ được đưa vào kho lưu trữ (chỉ xem). Bạn có chắc chắn muốn lưu trữ?",
    btnLabel: "Lưu trữ",
    variant: "warning",
    icon: Archive,
  },
};

// ────────────────────────────────────────────────────────────────────────
// Timeline Bar Component
// ────────────────────────────────────────────────────────────────────────

function CycleTimeline({ startDate, endDate }) {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  let progress = 0;
  if (now > end) progress = 100;
  else if (now > start) {
    progress = Math.round(((now - start) / (end - start)) * 100);
  }

  const isExpired = now > end;

  return (
    <div className="space-y-1.5 mt-3">
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>Bắt đầu: {formatDate(startDate)}</span>
        <span className={isExpired ? "text-destructive" : ""}>Kết thúc: {formatDate(endDate)}</span>
      </div>
      <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isExpired ? "bg-muted-foreground" : "bg-primary"}`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Cycle Card Component
// ────────────────────────────────────────────────────────────────────────

function CycleCard({ cycle, onTransition }) {
  const navigate = useNavigate();

  // Determine available actions based on current status
  const actions = [];
  
  if (cycle.status === "PLANNING") {
    actions.push({ id: "open", label: "Mở đợt", icon: Play, color: "text-green-600 bg-green-50 hover:bg-green-100" });
  } else if (cycle.status === "OPEN") {
    actions.push({ id: "startReview", label: "Xét duyệt", icon: CheckCircle, color: "text-orange-600 bg-orange-50 hover:bg-orange-100" });
  } else if (cycle.status === "REVIEWING") {
    actions.push({ id: "close", label: "Đóng", icon: Archive, color: "text-red-600 bg-red-50 hover:bg-red-100" });
  } else if (cycle.status === "CLOSED") {
    actions.push({ id: "archive", label: "Lưu trữ", icon: Layers, color: "text-gray-600 bg-gray-100 hover:bg-gray-200" });
  }

  const canEdit = cycle.status !== "ARCHIVED";

  return (
    <Card className="border-border shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                {cycle.year}
              </span>
              <StatusBadge status={cycle.status} statusMap={CYCLE_STATUS_MAP} />
            </div>
            <h2 className="text-lg font-bold text-foreground line-clamp-2">
              {cycle.name}
            </h2>
          </div>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground -mt-1 -mr-1"
              onClick={() => navigate(`/settings/cycles/${cycle.id}/edit`)}
              aria-label="Chỉnh sửa"
            >
              <Pencil size={16} />
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {cycle.description || "Chưa có mô tả."}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg bg-surface-container-low border border-border">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
              <FileText size={12} /> Số đề xuất
            </p>
            <p className="text-sm font-semibold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
              {cycle.proposalCount || 0} hồ sơ
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
              <TrendingUp size={12} /> Kinh phí phân bổ
            </p>
            <p className="text-sm font-semibold text-green-700" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(cycle.totalFunding || 0)}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="pt-3 border-t border-border mt-auto">
          {cycle.status === "PLANNING" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} /> Chưa bắt đầu
            </div>
          ) : (
            <CycleTimeline
              startDate={cycle.submissionDeadline ? new Date(new Date(cycle.submissionDeadline).getTime() - 30*24*60*60*1000).toISOString() : null} // Mock start date as 30 days before deadline
              endDate={cycle.submissionDeadline}
            />
          )}
        </div>

        {/* State Machine Actions */}
        {actions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex gap-2">
            {actions.map((act) => (
              <Button
                key={act.id}
                variant="outline"
                className={`flex-1 border-transparent ${act.color}`}
                onClick={() => onTransition(act.id, cycle)}
              >
                <act.icon size={16} className="mr-2" aria-hidden="true" />
                {act.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────

export default function CycleManagement() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  
  // Transition State
  const [transitionTarget, setTransitionTarget] = useState(null); // { actionId, cycle }

  // Mutations
  const openMutation = useOpenCycle();
  const startReviewMutation = useStartReviewCycle();
  const closeMutation = useCloseCycle();
  const archiveMutation = useArchiveCycle();

  // Query
  const filters = {
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(yearFilter !== "ALL" && { year: yearFilter }),
  };
  const { data, isLoading } = useCycles(filters);
  const cycles = data?.data || [];

  const handleTransitionClick = (actionId, cycle) => {
    setTransitionTarget({ actionId, cycle });
  };

  const confirmTransition = async () => {
    if (!transitionTarget) return;
    const { actionId, cycle } = transitionTarget;
    
    try {
      if (actionId === "open") await openMutation.mutateAsync(cycle.id);
      else if (actionId === "startReview") await startReviewMutation.mutateAsync(cycle.id);
      else if (actionId === "close") await closeMutation.mutateAsync(cycle.id);
      else if (actionId === "archive") await archiveMutation.mutateAsync(cycle.id);
      
      setTransitionTarget(null);
    } catch (err) {
      console.error("Transition failed:", err);
    }
  };

  // Determine loading state
  const isTransitioning = 
    openMutation.isPending || 
    startReviewMutation.isPending || 
    closeMutation.isPending || 
    archiveMutation.isPending;

  const currentTransitionConfig = transitionTarget ? TRANSITIONS[transitionTarget.actionId] : null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 motion-reduce:animate-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ textWrap: "balance" }}>
            Chu kỳ tài trợ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lên kế hoạch, giám sát và thực hiện các chu kỳ nghiên cứu khoa học.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
          <Link to="/settings/cycles/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Tạo chu kỳ mới
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <FilterPills
          options={CYCLE_FILTERS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        
        <div className="flex items-center gap-2">
          <label htmlFor="year-filter" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Năm:
          </label>
          <select
            id="year-filter"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">Tất cả</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <LoadingState message="Đang tải danh sách chu kỳ…" />
      ) : cycles.length === 0 ? (
        <div className="pt-10">
          <EmptyState
            icon={Calendar}
            title="Không tìm thấy chu kỳ nào"
            description={
              statusFilter !== "ALL" || yearFilter !== "ALL"
                ? "Không có kết quả khớp với bộ lọc. Hãy thử thay đổi tiêu chí tìm kiếm."
                : "Hệ thống chưa có chu kỳ tài trợ nào. Tạo chu kỳ mới để bắt đầu nhận hồ sơ."
            }
            actionLabel="Tạo chu kỳ mới"
            onAction={() => window.location.href = "/settings/cycles/new"}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} onTransition={handleTransitionClick} />
          ))}
        </div>
      )}

      {/* State Machine Confirm Dialog */}
      <ConfirmDialog
        open={!!transitionTarget}
        onClose={() => setTransitionTarget(null)}
        onConfirm={confirmTransition}
        title={currentTransitionConfig?.title}
        description={currentTransitionConfig?.description}
        confirmLabel={currentTransitionConfig?.btnLabel}
        variant={currentTransitionConfig?.variant || "danger"}
        isLoading={isTransitioning}
      />
    </div>
  );
}
