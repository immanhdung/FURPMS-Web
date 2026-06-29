import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useDashboardOverview, useRecentActivity } from "../../hooks/useDashboard";
import { LoadingState } from "../../components/shared/LoadingState";
import { EmptyState } from "../../components/shared/EmptyState";
import {
  FileText,
  Clock,
  TrendingUp,
  Users,
  Shield,
  Bell,
  ArrowRight,
  BarChart3,
  Settings,
  Activity,
} from "lucide-react";
import { formatCurrency, formatRelativeTime } from "../../lib/utils";

export default function AdminDashboard({ user }) {
  const { data: overview, isLoading } = useDashboardOverview();
  const { data: activityData, isLoading: loadingActivity } = useRecentActivity();

  const activities = activityData || [];

  if (isLoading) {
    return <LoadingState message="Đang tải dashboard…" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-violet-50/50 to-purple-50/30 rounded-xl p-4 sm:p-6 border border-border">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ textWrap: "balance" }}>
          Chào Quản trị viên, {user?.fullName || "Admin"}.
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-4">
          Bảng điều khiển hệ thống FURPMS. Tổng quan toàn bộ hoạt động nghiên cứu.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link to="/analytics">
              <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" /> Phân tích hệ thống
            </Link>
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-surface-variant" asChild>
            <Link to="/users">
              <Users className="mr-2 h-4 w-4" aria-hidden="true" /> Quản lý người dùng
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards — 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileText size={18} /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đề xuất</p>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{overview?.activeProposals || 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center"><TrendingUp size={18} /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kinh phí</p>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(overview?.totalFunding || 0)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tổng phân bổ</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={18} /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Người dùng</p>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>48</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tài khoản hoạt động</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><Activity size={18} /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tình trạng</p>
            </div>
            <p className="text-lg font-bold text-green-600">Bình thường</p>
            <p className="text-xs text-muted-foreground mt-0.5">Hệ thống hoạt động ổn định</p>
          </CardContent>
        </Card>
      </div>

      {/* 2-column: Quick Actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground mb-2">Quản trị hệ thống</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 text-xs" asChild>
                <Link to="/users"><Users size={18} className="text-blue-500" /> Người dùng</Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 text-xs" asChild>
                <Link to="/settings/cycles"><Clock size={18} className="text-amber-500" /> Chu kỳ tài trợ</Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 text-xs" asChild>
                <Link to="/settings/lookups"><Settings size={18} className="text-gray-500" /> Danh mục hệ thống</Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 text-xs" asChild>
                <Link to="/analytics"><BarChart3 size={18} className="text-violet-500" /> Phân tích</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="border-border shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-surface-container flex justify-between items-center">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Bell size={14} aria-hidden="true" /> Hoạt động gần đây
            </h3>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link to="/notifications">Tất cả <ArrowRight size={12} className="ml-1" /></Link>
            </Button>
          </div>
          <div className="p-4">
            {loadingActivity ? (
              <LoadingState message="Đang tải…" />
            ) : activities.length === 0 ? (
              <EmptyState title="Chưa có hoạt động" />
            ) : (
              <div className="space-y-3">
                {activities.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.message}</p>
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
