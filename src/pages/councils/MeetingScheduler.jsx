import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { 
  ArrowLeft, CalendarDays, Video, MapPin, Clock, Users, Link as LinkIcon, Edit, CheckCircle2, FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { LoadingState } from "../../components/shared/LoadingState";
import { SelectField } from "../../components/forms/SelectField";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { 
  useCouncil, useMeeting, useScheduleMeeting 
} from "../../hooks/useCouncils";

const PLATFORM_OPTIONS = [
  { value: "GOOGLE_MEET", label: "Google Meet" },
  { value: "TEAMS", label: "Microsoft Teams" },
  { value: "ZOOM", label: "Zoom" },
  { value: "IN_PERSON", label: "Họp trực tiếp (Offline)" }
];

const DURATION_OPTIONS = [
  { value: "60", label: "60 phút (1 tiếng)" },
  { value: "90", label: "90 phút (1.5 tiếng)" },
  { value: "120", label: "120 phút (2 tiếng)" },
  { value: "180", label: "180 phút (3 tiếng)" }
];

const MEETING_STATUS = {
  SCHEDULED: { label: "Đã lên lịch", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "Đang diễn ra", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

export default function MeetingScheduler() {
  const { id: councilId } = useParams();
  const navigate = useNavigate();

  const { data: council, isLoading: loadingCouncil } = useCouncil(councilId);
  const { data: meeting, isLoading: loadingMeeting } = useMeeting(councilId);
  const scheduleMutation = useScheduleMeeting(councilId);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      platform: "GOOGLE_MEET",
      meetingLink: "",
      location: "",
      scheduledAt: "",
      durationMinutes: "120",
      agenda: "1. Tuyên bố lý do\n2. Báo cáo của chủ nhiệm đề tài\n3. Ý kiến phản biện\n4. Thảo luận chung\n5. Bỏ phiếu và kết luận",
    }
  });

  const selectedPlatform = watch("platform");
  const isOnline = ["GOOGLE_MEET", "TEAMS", "ZOOM"].includes(selectedPlatform);

  if (loadingCouncil || loadingMeeting) return <LoadingState message="Đang tải dữ liệu cuộc họp..." />;
  if (!council) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy hội đồng.</div>;

  const onSubmit = async (data) => {
    await scheduleMutation.mutateAsync({
      ...data,
      durationMinutes: Number(data.durationMinutes)
    });
  };

  const renderMeetingInfo = () => {
    const meetingDate = new Date(meeting.scheduledAt);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-surface/30 border-b border-border/50 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-foreground">{meeting.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Hội đồng đánh giá: {council.proposalTitle}
                  </CardDescription>
                </div>
                <StatusBadge status={meeting.status} statusMap={MEETING_STATUS} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Thời gian diễn ra</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {meetingDate.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} - {meetingDate.toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Thời lượng: {meeting.durationMinutes} phút</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    {meeting.platform === "IN_PERSON" ? <MapPin size={20} /> : <Video size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hình thức & Địa điểm</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {PLATFORM_OPTIONS.find(p => p.value === meeting.platform)?.label || meeting.platform}
                    </p>
                    {meeting.meetingLink && (
                      <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-0.5 flex items-center gap-1">
                        <LinkIcon size={12} /> Tham gia ngay
                      </a>
                    )}
                    {meeting.location && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin size={12} /> {meeting.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-primary" /> Agenda (Chương trình họp)
                </h3>
                <div className="p-4 bg-surface rounded-lg border border-border whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {meeting.agenda}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-surface/30 border-b border-border/50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users size={18} className="text-primary" /> Thành phần tham dự
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {council.members?.map(m => (
                  <div key={m.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-foreground">{m.fullName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.memberRole === "CHAIR" ? "Chủ tịch" : m.memberRole === "SECRETARY" ? "Thư ký" : "Phản biện"}
                      </p>
                    </div>
                    {m.status === "ACCEPTED" ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">Vắng/Chưa XN</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderScheduleForm = () => {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-surface/30 border-b border-border/50">
            <CardTitle>Tạo cuộc họp mới</CardTitle>
            <CardDescription>Điền các thông tin để lên lịch họp cho hội đồng.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề cuộc họp <span className="text-destructive">*</span></label>
                <Input 
                  placeholder="VD: Họp xét duyệt đề cương ABC"
                  {...register("title", { required: true })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nền tảng / Hình thức <span className="text-destructive">*</span></label>
                  <Controller
                    name="platform"
                    control={control}
                    render={({ field }) => (
                      <SelectField 
                        options={PLATFORM_OPTIONS} 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    )}
                  />
                </div>
                
                {isOnline ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Link tham dự (URL) <span className="text-destructive">*</span></label>
                    <Input 
                      placeholder="https://meet.google.com/..."
                      {...register("meetingLink", { required: isOnline })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phòng họp / Địa điểm <span className="text-destructive">*</span></label>
                    <Input 
                      placeholder="VD: Phòng họp số 1, Tòa Alpha"
                      {...register("location", { required: !isOnline })}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ngày giờ bắt đầu <span className="text-destructive">*</span></label>
                  <Input 
                    type="datetime-local"
                    {...register("scheduledAt", { required: true })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thời lượng dự kiến <span className="text-destructive">*</span></label>
                  <Controller
                    name="durationMinutes"
                    control={control}
                    render={({ field }) => (
                      <SelectField 
                        options={DURATION_OPTIONS} 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Agenda (Chương trình họp)</label>
                <Textarea 
                  className="min-h-[120px]"
                  placeholder="Ghi chú các nội dung chính..."
                  {...register("agenda")}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={scheduleMutation.isPending}>
                  <CalendarDays size={16} className="mr-2" />
                  {scheduleMutation.isPending ? "Đang tạo..." : "Lên lịch họp"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-1" /> Quay lại
          </Button>
          <div className="h-6 w-px bg-border mx-2 hidden sm:block"></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Lịch họp Hội đồng</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tổ chức và quản lý phiên họp đánh giá đề tài.
            </p>
          </div>
        </div>
      </div>

      {meeting ? renderMeetingInfo() : renderScheduleForm()}

    </div>
  );
}


