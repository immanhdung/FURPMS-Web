import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { 
  ArrowLeft, Users, ShieldCheck, Mail, Plus, Trash2, 
  CheckCircle2, AlertCircle, PlayCircle, Lock
} from "lucide-react";
import { toast } from "sonner";
import { 
  useCouncil, useUpdateCouncilStatus, 
  useRounds, useOpenRound,
  useInviteByEmail, useRemoveCouncilMember 
} from "../../hooks/useCouncils";
import { LoadingState } from "../../components/shared/LoadingState";
import { StatusBadge } from "../../components/shared/StatusBadge";

// ────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────
const COUNCIL_STATUS = {
  FORMING:    { label: "Đang thành lập", color: "bg-yellow-100 text-yellow-700" },
  READY:      { label: "Sẵn sàng",      color: "bg-blue-100 text-blue-700" },
  IN_MEETING: { label: "Đang họp",       color: "bg-purple-100 text-purple-700" },
  DECIDED:    { label: "Đã quyết định",  color: "bg-green-100 text-green-700" },
  CLOSED:     { label: "Đã đóng",        color: "bg-gray-100 text-gray-500" },
};

const ROUND_STATUS = {
  PENDING: { label: "Chưa mở", color: "bg-gray-100 text-gray-600" },
  OPEN:    { label: "Đang mở", color: "bg-blue-100 text-blue-700" },
  PASSED:  { label: "Đạt",    color: "bg-green-100 text-green-700" },
  FAILED:  { label: "Không đạt", color: "bg-red-100 text-red-700" },
};

const MEMBER_STATUS = {
  INVITED:  { label: "Đã mời",    color: "bg-blue-100 text-blue-700" },
  ACCEPTED: { label: "Chấp nhận", color: "bg-green-100 text-green-700" },
  DECLINED: { label: "Từ chối",   color: "bg-red-100 text-red-700" },
};

// ────────────────────────────────────────────────────────────────────────
// Page Component
// ────────────────────────────────────────────────────────────────────────
export default function CouncilSetup() {
  const { id: councilId } = useParams();
  const navigate = useNavigate();

  // Queries
  const { data: council, isLoading: loadingCouncil } = useCouncil(councilId);
  const { data: rounds = [], isLoading: loadingRounds } = useRounds(council?.proposalId);

  // Mutations
  const updateStatusMutation = useUpdateCouncilStatus(councilId);
  const openRoundMutation = useOpenRound(council?.proposalId);
  const inviteMutation = useInviteByEmail(councilId);
  const removeMemberMutation = useRemoveCouncilMember(councilId);

  // UI State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  if (loadingCouncil || loadingRounds) return <LoadingState message="Đang tải dữ liệu hội đồng..." />;
  if (!council) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy hội đồng.</div>;

  const isForming = council.status === "FORMING";
  const acceptedPercentage = Math.min(100, Math.round((council.acceptedMembers / council.maxMembersAllowed) * 100));
  const canFinalize = isForming && council.acceptedMembers >= council.minMembersRequired;

  const handleFinalizeCouncil = async () => {
    if (!canFinalize) {
      toast.error(`Cần tối thiểu ${council.minMembersRequired} thành viên chấp nhận để chốt hội đồng.`);
      return;
    }
    await updateStatusMutation.mutateAsync("READY");
  };

  const handleOpenRound = async (roundId) => {
    // The mutation's onError will handle the 409 Prerequisite Error automatically
    await openRoundMutation.mutateAsync(roundId);
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) {
      toast.error("Vui lòng điền đầy đủ Tên và Email.");
      return;
    }
    await inviteMutation.mutateAsync({ email: inviteEmail, name: inviteName, role: "REVIEWER" });
    setInviteModalOpen(false);
    setInviteEmail("");
    setInviteName("");
  };

  const handleRemoveMember = async (memberId) => {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      await removeMemberMutation.mutateAsync(memberId);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit -ml-3 text-muted-foreground" onClick={() => navigate("/meetings")}>
          <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách Hội đồng
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ textWrap: "balance" }}>
              Thiết lập Hội đồng: {council.proposalTitle}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quy trình tổ chức xét duyệt Vòng {council.roundNumber} ({council.dimension === "SCIENCE" ? "Khoa học" : "Tài chính"}).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={council.status} statusMap={COUNCIL_STATUS} />
            {isForming && (
              <Button 
                onClick={handleFinalizeCouncil} 
                disabled={!canFinalize || updateStatusMutation.isPending}
                className={canFinalize ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                {updateStatusMutation.isPending ? "Đang xử lý..." : "Chốt Hội đồng (READY)"}
              </Button>
            )}
            {!isForming && council.status !== "CLOSED" && (
              <Button onClick={() => navigate(`/councils/${council.id}/meeting`)} variant="outline">
                Lên lịch họp
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Rounds & Members) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Panel 1: Review Rounds Workflow */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border bg-surface/30">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" /> Tiến trình Vòng Xét duyệt
              </CardTitle>
              <CardDescription>
                Quản lý các vòng xét duyệt của Đề tài. Vòng Tài chính chỉ được mở khi Vòng Khoa học đã Đạt.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface/10">
                      <TableHead>Vòng</TableHead>
                      <TableHead>Lĩnh vực</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Kết quả</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rounds.sort((a,b) => a.sequence - b.sequence).map((round) => (
                      <TableRow key={round.id}>
                        <TableCell className="font-medium">Vòng {round.roundNumber}</TableCell>
                        <TableCell>{round.dimension === "SCIENCE" ? "Khoa học" : "Tài chính"}</TableCell>
                        <TableCell><StatusBadge status={round.status} statusMap={ROUND_STATUS} /></TableCell>
                        <TableCell>
                          {round.result === "APPROVED" && <Badge className="bg-green-100 text-green-700">ĐẠT</Badge>}
                          {round.result === "REJECTED" && <Badge className="bg-red-100 text-red-700">KHÔNG ĐẠT</Badge>}
                          {!round.result && <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          {round.status === "PENDING" ? (
                            <Button size="sm" variant="outline" onClick={() => handleOpenRound(round.id)} disabled={openRoundMutation.isPending}>
                              <PlayCircle size={14} className="mr-1.5" /> Mở vòng
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" disabled>
                              <Lock size={14} className="mr-1.5 text-muted-foreground" /> Khóa
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {rounds.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Chưa có vòng xét duyệt nào.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Panel 3: Members Roster */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border bg-surface/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users size={18} className="text-primary" /> Thành viên Hội đồng
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Quản lý thành viên tham gia xét duyệt.
                  </CardDescription>
                </div>
                {isForming && (
                  <Button size="sm" onClick={() => setInviteModalOpen(true)}>
                    <Mail size={14} className="mr-1.5" /> Mời chuyên gia (Email)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Progress Bar Header */}
              <div className="p-4 bg-surface/50 border-b border-border flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground">Thành viên đã chấp nhận tham gia</span>
                    <span className="font-medium text-foreground">{council.acceptedMembers} / {council.maxMembersAllowed}</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${canFinalize ? "bg-green-500" : "bg-primary"}`}
                      style={{ width: `${acceptedPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                    <span>Tối thiểu cần: {council.minMembersRequired}</span>
                    <span>Tối đa: {council.maxMembersAllowed}</span>
                  </div>
                </div>
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface/10">
                      <TableHead>Họ tên / Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Loại</TableHead>
                      {isForming && <TableHead className="w-12"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {council.members?.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{m.fullName}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </TableCell>
                        <TableCell>
                          {m.memberRole === "CHAIR" ? "Chủ tịch" : 
                           m.memberRole === "SECRETARY" ? "Thư ký" : "Phản biện"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={m.status} statusMap={MEMBER_STATUS} />
                        </TableCell>
                        <TableCell>
                          {m.isExternal ? (
                            <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 bg-amber-50">Ngoài FPT</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Nội bộ</Badge>
                          )}
                        </TableCell>
                        {isForming && (
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                              onClick={() => handleRemoveMember(m.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {(!council.members || council.members.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Chưa có thành viên nào trong hội đồng.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Info) */}
        <div className="space-y-6">
          {/* Panel 2: Council Info */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border bg-surface/30">
              <CardTitle className="text-base flex items-center gap-2">
                Thông tin chung Hội đồng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Số Quyết định thành lập</p>
                <p className="font-medium text-foreground">{council.establishmentDecisionNo || "Chưa cấp"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ngày thành lập</p>
                <p className="font-medium text-foreground">
                  {council.establishedAt ? new Date(council.establishedAt).toLocaleDateString("vi-VN") : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Hạn chót họp HĐ</p>
                <p className="font-medium text-foreground">
                  {council.meetingDeadline ? new Date(council.meetingDeadline).toLocaleDateString("vi-VN") : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loại hội đồng</p>
                <Badge variant="outline" className="mt-1">
                  {council.councilType === "PROPOSAL_REVIEW" ? "Xét duyệt Đề cương" : council.councilType}
                </Badge>
              </div>

              {canFinalize && isForming && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-sm text-green-800">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
                  <p>Hội đồng đã đủ số lượng thành viên tối thiểu. Bạn có thể <b>Chốt Hội đồng</b> để chuyển sang giai đoạn lên lịch họp.</p>
                </div>
              )}
              {!canFinalize && isForming && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
                  <p>Cần tối thiểu {council.minMembersRequired} thành viên xác nhận để có thể chốt hội đồng.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mời chuyên gia đánh giá (Bên ngoài)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Hệ thống sẽ gửi email chứa đường link xác thực an toàn (Token-based) tới chuyên gia.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Họ và tên chuyên gia <span className="text-destructive">*</span></label>
              <Input 
                placeholder="VD: PGS.TS. Nguyễn Văn A" 
                value={inviteName} 
                onChange={(e) => setInviteName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email liên hệ <span className="text-destructive">*</span></label>
              <Input 
                type="email" 
                placeholder="chuyengia@example.com" 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>Hủy</Button>
            <Button onClick={handleInvite} disabled={inviteMutation.isPending || !inviteName || !inviteEmail}>
              {inviteMutation.isPending ? "Đang gửi..." : "Gửi thư mời"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
