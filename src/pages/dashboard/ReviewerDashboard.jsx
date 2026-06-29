import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useDashboardOverview, useRecentActivity } from "../../hooks/useDashboard";
import { LoadingState } from "../../components/shared/LoadingState";
import { EmptyState } from "../../components/shared/EmptyState";
import {
  Clock,
  Mail,
  ClipboardCheck,
  Star,
  Bell,
  ArrowRight,
} from "lucide-react";
import { formatRelativeTime } from "../../lib/utils";

export default function ReviewerDashboard({ user }) {
  const { data: overview, isLoading } = useDashboardOverview();
  const { data: activityData, isLoading: loadingActivity } = useRecentActivity();

  const activities = activityData || [];

  if (isLoading) {
    return <LoadingState message="Đang tải dashboard…" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-xl p-4 sm:p-6 border border-border">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ textWrap: "balance" }}>
          Xin chào, {user?.fullName || "Chuyên gia đánh giá"}.
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-4">
          Cảm ơn bạn đã tham gia hội đồng đánh giá. Vui lòng kiểm tra các lời mời và đánh giá được phân công bên dưới.
        </p>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
          <Link to="/meetings">
            <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden="true" /> Xem lời mời đánh giá
          </Link>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Mail size={20} /></div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lời mời chờ</p>
            </div>
            <p className="text-3xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>2</p>
            <p className="text-xs text-muted-foreground mt-1">Cần phản hồi trước khi hết hạn</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Star size={20} /></div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Đánh giá cần nộp</p>
            </div>
            <p className="text-3xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>1</p>
            <p className="text-xs text-muted-foreground mt-1">Đề xuất đang chờ chấm điểm</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Clock size={20} /></div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mốc tiếp theo</p>
            </div>
            <p className="text-lg font-bold text-foreground" style={{ textWrap: "balance" }}>{overview?.nextMilestone?.title || "Không có"}</p>
            <p className="text-xs text-destructive mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>Còn {overview?.nextMilestone?.dueHours || 0} giờ</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Thao tác nhanh</h3>
            <Button variant="outline" className="w-full justify-start text-sm" asChild>
              <Link to="/meetings"><ClipboardCheck size={14} className="mr-2" /> Xem Hội đồng đánh giá</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm" asChild>
              <Link to="/profile"><Star size={14} className="mr-2" /> Cập nhật hồ sơ khoa học</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-surface-container">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Bell size={14} aria-hidden="true" /> Hoạt động gần đây
            </h3>
          </div>
          <div className="p-4">
            {loadingActivity ? (
              <LoadingState message="Đang tải…" />
            ) : activities.length === 0 ? (
              <EmptyState title="Chưa có hoạt động" />
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
