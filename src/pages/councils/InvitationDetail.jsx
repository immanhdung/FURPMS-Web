import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Calendar, Users, Briefcase, FileText, Check, X, ShieldAlert } from "lucide-react";
import { useCouncil, useRespondInvitation } from "../../hooks/useCouncils";
import { useAuthStore } from "../../store/authStore";
import { LoadingState } from "../../components/shared/LoadingState";
import { formatDate } from "../../lib/utils";

export default function InvitationDetail() {
  const { id: councilId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: council, isLoading } = useCouncil(councilId);
  const respondMutation = useRespondInvitation();

  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineError, setDeclineError] = useState("");

  if (isLoading) {
    return <LoadingState message="Đang tải thông tin lời mời…" />;
  }

  if (!council) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Không tìm thấy lời mời</h2>
        <p className="text-muted-foreground mt-2">Lời mời này có thể không tồn tại hoặc đã bị thu hồi.</p>
        <Button className="mt-6" onClick={() => navigate("/meetings")}>Quay về Bảng điều khiển</Button>
      </div>
    );
  }

  // Find the current user's membership record in this council
  // In a real app, member.userId or member.email matches the current user
  const myMembership = council.members?.find(
    (m) => m.email === user?.email || m.userId === user?.id
  );

  const handleAccept = async () => {
    if (!myMembership?.id) return;
    try {
      await respondMutation.mutateAsync({
        memberId: myMembership.id,
        response: "ACCEPTED"
      });
      navigate("/meetings");
    } catch (e) {
      // handled by hook
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      setDeclineError("Vui lòng nhập lý do từ chối để ban tổ chức sắp xếp nhân sự thay thế.");
      return;
    }
    if (!myMembership?.id) return;
    
    try {
      await respondMutation.mutateAsync({
        memberId: myMembership.id,
        response: "DECLINED",
        declineReason: declineReason.trim()
      });
      setDeclineOpen(false);
      navigate("/meetings");
    } catch (e) {
      // handled by hook
    }
  };

  const isResponded = myMembership?.status === "ACCEPTED" || myMembership?.status === "DECLINED";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chi tiết Lời mời tham gia Hội đồng</h1>
        <p className="text-muted-foreground mt-1">
          Trân trọng kính mời {user?.fullName || "Chuyên gia"} tham gia đánh giá đề tài nghiên cứu khoa học.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-6">
              
              <div>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText size={16} /> Thông tin Đề tài
                </h3>
                <h2 className="text-xl font-bold text-foreground mb-2" style={{ textWrap: "pretty" }}>
                  {council.proposalTitle}
                </h2>
                <div className="flex gap-2 text-sm text-muted-foreground mb-4">
                  <Badge variant="secondary" className="font-normal">Vòng {council.roundNumber}</Badge>
                  <Badge variant="outline" className="font-normal">{council.dimension === "SCIENCE" ? "Khoa học" : "Tài chính"}</Badge>
                </div>
                
                <div className="bg-surface/50 p-4 rounded-lg border border-border/50 text-sm leading-relaxed text-foreground/90">
                  <p className="font-semibold mb-1">Tóm tắt (Abstract):</p>
                  Đề xuất tập trung nghiên cứu và ứng dụng các công nghệ tiên tiến nhằm giải quyết vấn đề cấp thiết hiện nay. 
                  Mục tiêu chính là tối ưu hóa quy trình, nâng cao hiệu suất và mang lại giá trị thực tiễn cao cho cộng đồng và doanh nghiệp.
                  {/* In a real app, this would be proposal.abstractVI */}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info & Actions */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Briefcase size={16} className="text-primary" /> Yêu cầu công việc
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Vai trò của bạn:</span>
                  <span className="font-medium text-foreground">{myMembership?.memberRole === "REVIEWER" ? "Phản biện" : (myMembership?.memberRole || "Chuyên gia")}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Hình thức họp:</span>
                  <span className="font-medium text-foreground">
                    {council.meeting?.platform === "GOOGLE_MEET" ? "Trực tuyến (Google Meet)" : 
                     council.meeting?.platform === "TEAMS" ? "Trực tuyến (Teams)" : "Trực tiếp"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Thời gian dự kiến:</span>
                  <span className="font-medium text-foreground text-right">
                    {council.meeting?.scheduledAt ? new Date(council.meeting.scheduledAt).toLocaleString("vi-VN") : "Sẽ thông báo sau"}
                  </span>
                </div>
              </div>

              {!isResponded ? (
                <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                    onClick={handleAccept}
                    disabled={respondMutation.isPending || !myMembership}
                  >
                    {respondMutation.isPending ? "Đang xử lý..." : <><Check size={16} className="mr-2" /> Chấp nhận tham gia</>}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" 
                    onClick={() => setDeclineOpen(true)}
                    disabled={respondMutation.isPending || !myMembership}
                  >
                    <X size={16} className="mr-2" /> Từ chối
                  </Button>
                </div>
              ) : (
                <div className={`pt-4 p-3 rounded-lg text-center font-medium ${myMembership.status === "ACCEPTED" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {myMembership.status === "ACCEPTED" ? "Bạn đã chấp nhận tham gia" : "Bạn đã từ chối tham gia"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decline Reason Modal */}
      <Dialog open={declineOpen} onOpenChange={(open) => {
        setDeclineOpen(open);
        if (!open) {
          setDeclineReason("");
          setDeclineError("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận từ chối</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Vui lòng cho ban tổ chức biết lý do bạn không thể tham gia hội đồng này để chúng tôi có thể sắp xếp nhân sự thay thế phù hợp.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Lý do từ chối <span className="text-destructive">*</span></label>
              <Textarea 
                placeholder="Ví dụ: Bận lịch trình công tác, hoặc không đúng chuyên môn..." 
                value={declineReason}
                onChange={(e) => {
                  setDeclineReason(e.target.value);
                  if (e.target.value.trim()) setDeclineError("");
                }}
                className={declineError ? "border-destructive focus-visible:ring-destructive" : ""}
                rows={4}
              />
              {declineError && <p className="text-sm text-destructive font-medium">{declineError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDecline} disabled={respondMutation.isPending}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
