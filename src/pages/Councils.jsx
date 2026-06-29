import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
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
  Users,
  Video,
  Calendar,
  ChevronRight,
  Shield,
  Eye,
  UserCheck,
  Clock,
  CheckCircle2,
  ExternalLink,
  Settings2,
  CalendarDays,
  FileEdit,
  FileCheck
} from "lucide-react";
import { StatusBadge } from "../components/shared/StatusBadge";
import { InfoBlock } from "../components/shared/InfoBlock";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingState } from "../components/shared/LoadingState";
import { FilterPills } from "../components/shared/FilterPills";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { useMyCouncils, useUpdateCouncilStatus } from "../hooks/useCouncils";
import { useAuthStore } from "../store/authStore";

// ────────────────────────────────────────────────────────────────────────
// Status mappings
// ────────────────────────────────────────────────────────────────────────
const COUNCIL_STATUS = {
  FORMING:    { label: "Đang thành lập", color: "bg-yellow-100 text-yellow-700", icon: Users },
  READY:      { label: "Sẵn sàng",      color: "bg-blue-100 text-blue-700",     icon: Shield },
  IN_MEETING: { label: "Đang họp",       color: "bg-purple-100 text-purple-700", icon: Video },
  DECIDED:    { label: "Đã quyết định",  color: "bg-green-100 text-green-700",   icon: CheckCircle2 },
  CLOSED:     { label: "Đã đóng",        color: "bg-gray-100 text-gray-500",     icon: Clock },
};

const COUNCIL_FILTERS = [
  { id: "ALL", label: "Tất cả" },
  { id: "FORMING", label: "Đang thành lập" },
  { id: "READY", label: "Sẵn sàng" },
  { id: "IN_MEETING", label: "Đang họp" },
  { id: "DECIDED", label: "Đã quyết định" },
  { id: "CLOSED", label: "Đã đóng" },
];

const MEMBER_STATUS = {
  INVITED:  { label: "Đã mời",    color: "bg-blue-100 text-blue-700" },
  ACCEPTED: { label: "Chấp nhận", color: "bg-green-100 text-green-700" },
  DECLINED: { label: "Từ chối",   color: "bg-red-100 text-red-700" },
};

const MEMBER_ROLE = {
  CHAIR:     "Chủ tịch",
  REVIEWER:  "Phản biện",
  SECRETARY: "Thư ký",
};

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";
const formatDateTime = (iso) => iso ? new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";

// ────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────

function CouncilCard({ council, onOpen, isStaffOrAdmin }) {
  const navigate = useNavigate();
  
  // Define progress percentage for accepted members
  const acceptedPercentage = Math.min(100, Math.round((council.acceptedMembers / council.maxMembersAllowed) * 100));

  return (
    <Card className="border-border shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-surface/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2" style={{ textWrap: "pretty" }}>{council.proposalTitle}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Vòng {council.roundNumber} — {council.dimension} • QĐ {council.establishmentDecisionNo || "Chưa có"}
            </p>
          </div>
          <StatusBadge status={council.status} statusMap={COUNCIL_STATUS} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Members summary */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <UserCheck size={14} className="text-green-600" aria-hidden="true" />
              <span>Thành viên xác nhận</span>
            </div>
            <span className="font-medium text-foreground text-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
              {council.acceptedMembers} / {council.maxMembersAllowed}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${council.acceptedMembers >= council.minMembersRequired ? "bg-green-500" : "bg-primary"}`}
              style={{ width: `${acceptedPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-right">Tối thiểu: {council.minMembersRequired}</p>
        </div>

        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={14} aria-hidden="true" />
            <span>Hạn họp: {formatDate(council.meetingDeadline)}</span>
          </div>
        </div>

        {/* Meeting info */}
        {council.meeting && (
          <div className="bg-tertiary/5 border border-tertiary/20 rounded-lg p-3 flex items-center gap-3">
            <Video size={18} className="text-tertiary flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{council.meeting.title}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(council.meeting.scheduledAt)} • {council.meeting.durationMinutes} phút • {council.meeting.platform}</p>
            </div>
            {council.meeting.meetingLink && (
              <a
                href={council.meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-tertiary hover:text-tertiary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                aria-label={`Tham gia cuộc họp: ${council.meeting.title}`}
              >
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        {/* Decision */}
        {council.decision && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-700 uppercase mb-1">Kết quả: {council.decision.result}</p>
            <p className="text-sm text-green-800 line-clamp-2">{council.decision.councilComments}</p>
            {council.decision.averageScore && (
              <p className="text-xs text-green-600 mt-1 font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>Điểm TB: {council.decision.averageScore}/100</p>
            )}
          </div>
        )}
      </div>

      {/* Card Footer with Action Buttons */}
      <div className="px-4 sm:px-5 py-3 border-t border-border bg-surface/30 flex justify-between items-center gap-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onOpen(council)}>
          <Eye className="h-4 w-4 mr-1.5" /> Chi tiết
        </Button>
        
        <div className="flex items-center gap-2">
          {isStaffOrAdmin ? (
            <>
              <Button size="sm" variant="outline" onClick={() => navigate(`/councils/${council.id}/setup`)}>
                <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Thiết lập HĐ
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate(`/councils/${council.id}/meeting`)}>
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" /> Lên lịch họp
              </Button>
            </>
          ) : (
            <>
              {council.status === "IN_MEETING" && (
                <Button size="sm" onClick={() => navigate(`/councils/${council.id}/scoring`)}>
                  <FileEdit className="h-3.5 w-3.5 mr-1.5" /> Chấm điểm
                </Button>
              )}
              {council.status === "DECIDED" && (
                <Button size="sm" variant="outline" onClick={() => navigate(`/councils/${council.id}/scoring`)}>
                  <FileCheck className="h-3.5 w-3.5 mr-1.5" /> Xem quyết định
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function CouncilDetailDialog({ open, onOpenChange, council, isStaffOrAdmin }) {
  const updateStatusMutation = useUpdateCouncilStatus(council?.id);
  const [confirmStatus, setConfirmStatus] = useState(null);

  if (!council) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatusMutation.mutateAsync(newStatus);
      setConfirmStatus(null);
    } catch (e) {
      // handled in hook
    }
  };

  const getAvailableTransitions = () => {
    if (!isStaffOrAdmin) return [];
    
    switch (council.status) {
      case "FORMING":
        return council.acceptedMembers >= council.minMembersRequired 
          ? [{ status: "READY", label: "Chuyển sang Sẵn sàng", variant: "default" }]
          : [];
      case "READY":
        return [{ status: "IN_MEETING", label: "Bắt đầu họp", variant: "default" }];
      case "IN_MEETING":
        return [{ status: "DECIDED", label: "Chốt quyết định", variant: "default" }];
      case "DECIDED":
        return [{ status: "CLOSED", label: "Đóng hội đồng", variant: "outline" }];
      default:
        return [];
    }
  };

  const transitions = getAvailableTransitions();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground pr-8" style={{ textWrap: "balance" }}>
              Hội đồng: {council.proposalTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoBlock label="Trạng thái">
                <StatusBadge status={council.status} statusMap={COUNCIL_STATUS} />
              </InfoBlock>
              <InfoBlock label="Loại" value={council.councilType === "PROPOSAL_REVIEW" ? "Xét duyệt đề cương" : council.councilType} />
              <InfoBlock label="QĐ thành lập" value={council.establishmentDecisionNo || "Chưa có"} />
              <InfoBlock label="Hạn họp" value={formatDate(council.meetingDeadline)} />
            </div>

            {/* Members Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">Thành viên hội đồng</h4>
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="font-medium text-foreground">{council.acceptedMembers} / {council.maxMembersAllowed}</span>
                  chấp nhận
                </div>
              </div>
              <div className="overflow-x-auto border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface/50">
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Nguồn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {council.members?.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{m.fullName}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{MEMBER_ROLE[m.memberRole] || m.memberRole}</TableCell>
                        <TableCell>
                          <StatusBadge status={m.status} statusMap={MEMBER_STATUS} />
                        </TableCell>
                        <TableCell>
                          {m.isExternal ? (
                            <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 bg-amber-50">Ngoài FPT</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-surface text-muted-foreground">Nội bộ</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!council.members || council.members.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          Chưa có thành viên nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Admin Actions */}
            {transitions.length > 0 && (
              <div className="pt-4 border-t border-border flex justify-end gap-3">
                {transitions.map(t => (
                  <Button 
                    key={t.status} 
                    variant={t.variant}
                    onClick={() => setConfirmStatus(t.status)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending && confirmStatus === t.status ? (
                       <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    ) : null}
                    {t.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Status Transition Dialog */}
      <ConfirmDialog
        open={!!confirmStatus}
        onOpenChange={(isOpen) => !isOpen && setConfirmStatus(null)}
        title="Xác nhận chuyển trạng thái"
        description={`Bạn có chắc chắn muốn chuyển trạng thái hội đồng sang "${COUNCIL_STATUS[confirmStatus]?.label || confirmStatus}"?`}
        confirmLabel="Xác nhận"
        onConfirm={() => handleStatusChange(confirmStatus)}
        variant="default"
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────
export default function CouncilsPage() {
  const { data: allCouncils = [], isLoading } = useMyCouncils();
  const { hasRole } = useAuthStore();
  const isStaffOrAdmin = hasRole(["Admin", "Staff"]);

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredCouncils = allCouncils.filter(c => activeFilter === "ALL" || c.status === activeFilter);

  const openDetail = (council) => {
    setSelectedCouncil(council);
    setDetailOpen(true);
  };

  if (isLoading) {
    return <LoadingState message="Đang tải danh sách hội đồng…" />;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 motion-reduce:animate-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ textWrap: "balance" }}>Hội đồng & Cuộc họp</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isStaffOrAdmin 
            ? "Quản lý toàn bộ hội đồng xét duyệt, lên lịch họp và chốt kết quả." 
            : "Danh sách các hội đồng xét duyệt mà bạn được mời tham gia."}
        </p>
      </div>

      {/* Filter Bar */}
      <FilterPills
        options={COUNCIL_FILTERS}
        value={activeFilter}
        onChange={setActiveFilter}
      />

      {/* Council Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCouncils.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Users}
              title="Không có hội đồng nào"
              description={
                activeFilter !== "ALL" 
                  ? "Không tìm thấy hội đồng phù hợp với bộ lọc hiện tại." 
                  : "Chưa có hội đồng xét duyệt nào."
              }
            />
          </div>
        ) : (
          filteredCouncils.map((council) => (
            <CouncilCard 
              key={council.id} 
              council={council} 
              onOpen={openDetail} 
              isStaffOrAdmin={isStaffOrAdmin} 
            />
          ))
        )}
      </div>

      {/* Detail Dialog */}
      <CouncilDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        council={selectedCouncil}
        isStaffOrAdmin={isStaffOrAdmin}
      />
    </div>
  );
}
