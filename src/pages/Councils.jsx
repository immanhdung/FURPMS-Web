import React, { useEffect, useState } from "react";
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
  UserX,
  Clock,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { api } from "../api/axios";

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
export default function CouncilsPage() {
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetchCouncils = async () => {
      try {
        const res = await api.get("/councils/my-memberships");
        if (res.data.success) setCouncils(res.data.data);
      } catch (err) {
        console.error("Failed to fetch councils", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCouncils();
  }, []);

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";
  const formatDateTime = (iso) => iso ? new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";

  const openDetail = (council) => {
    setSelectedCouncil(council);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải hội đồng...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hội đồng & Cuộc họp</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý các hội đồng xét duyệt và lịch họp.</p>
      </div>

      {/* Council Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {councils.length === 0 ? (
          <p className="text-muted-foreground col-span-2 text-center py-12">Bạn chưa tham gia hội đồng nào.</p>
        ) : (
          councils.map((council) => (
            <Card key={council.id} className="border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-5 border-b border-border bg-surface/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">{council.proposalTitle}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vòng {council.roundNumber} — {council.dimension} • QĐ {council.establishmentDecisionNo}
                    </p>
                  </div>
                  <StatusBadge status={council.status} map={COUNCIL_STATUS} />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Members summary */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <UserCheck size={14} className="text-green-600" />
                    <span>{council.acceptedMembers}/{council.maxMembersAllowed} thành viên</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar size={14} />
                    <span>Hạn: {formatDate(council.meetingDeadline)}</span>
                  </div>
                </div>

                {/* Meeting info */}
                {council.meeting && (
                  <div className="bg-tertiary/5 border border-tertiary/20 rounded-lg p-3 flex items-center gap-3">
                    <Video size={18} className="text-tertiary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{council.meeting.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(council.meeting.scheduledAt)} • {council.meeting.durationMinutes} phút • {council.meeting.platform}</p>
                    </div>
                    {council.meeting.meetingLink && (
                      <a href={council.meeting.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 text-tertiary hover:text-tertiary/80"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                )}

                {/* Decision */}
                {council.decision && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-700 uppercase mb-1">Kết quả: {council.decision.result}</p>
                    <p className="text-sm text-green-800">{council.decision.councilComments}</p>
                    {council.decision.averageScore && (
                      <p className="text-xs text-green-600 mt-1 font-medium">Điểm trung bình: {council.decision.averageScore}/100</p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-border bg-surface/30 flex justify-end">
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => openDetail(council)}>
                  <Eye className="h-4 w-4 mr-1" /> Xem chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground pr-8">
              Hội đồng: {selectedCouncil?.proposalTitle}
            </DialogTitle>
          </DialogHeader>

          {selectedCouncil && (
            <div className="space-y-6 mt-2">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Trạng thái</dt>
                  <dd className="mt-1"><StatusBadge status={selectedCouncil.status} map={COUNCIL_STATUS} /></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Loại</dt>
                  <dd className="mt-1 text-foreground">{selectedCouncil.councilType === "PROPOSAL_REVIEW" ? "Xét duyệt đề cương" : selectedCouncil.councilType}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">QĐ thành lập</dt>
                  <dd className="mt-1 text-foreground">{selectedCouncil.establishmentDecisionNo}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Hạn họp</dt>
                  <dd className="mt-1 text-foreground">{formatDate(selectedCouncil.meetingDeadline)}</dd>
                </div>
              </div>

              {/* Members Table */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Thành viên hội đồng</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Nguồn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCouncil.members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{m.fullName}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </TableCell>
                        <TableCell className="text-sm">{MEMBER_ROLE[m.memberRole] || m.memberRole}</TableCell>
                        <TableCell>
                          <StatusBadge status={m.status} map={MEMBER_STATUS} />
                        </TableCell>
                        <TableCell>
                          {m.isExternal ? (
                            <Badge variant="outline" className="text-xs border-amber-400 text-amber-700">Bên ngoài</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Nội bộ</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
