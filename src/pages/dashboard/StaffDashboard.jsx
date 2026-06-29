import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useDashboardOverview, useRecentActivity } from "../../hooks/useDashboard";
import { useProposals } from "../../hooks/useProposals";
import { LoadingState } from "../../components/shared/LoadingState";
import { EmptyState } from "../../components/shared/EmptyState";
import {
  FileText,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { formatCurrency, formatRelativeTime, getStatusConfig } from "../../lib/utils";

export default function StaffDashboard({ user }) {
  const { data: overview, isLoading: loadingOverview } = useDashboardOverview();
  const { data: activityData, isLoading: loadingActivity } = useRecentActivity();
  const { data: pendingData } = useProposals({ status: "SUBMITTED", limit: 5 });

  const activities = activityData || [];
  const pendingProposals = pendingData?.data || [];

  if (loadingOverview) {
    return <LoadingState message="Đang tải dashboard…" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl p-4 sm:p-6 border border-border">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ textWrap: "balance" }}>
          Xin chào, {user?.fullName || "Cán bộ QLKH"}.
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-4">
          Có {pendingProposals.length} đề xuất đang chờ xử lý. Tổng kinh phí quản lý: {formatCurrency(overview?.totalFunding || 0)}.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link to="/proposals">
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" /> Quản lý đề xuất
            </Link>
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-surface-variant" asChild>
            <Link to="/settings/cycles">
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" /> Quản lý chu kỳ
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><AlertTriangle size={18} /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chờ xử lý</p>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{pendingProposals.length}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileText size={18} /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng đề xuất</p>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{overview?.activeProposals || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center"><TrendingUp size={18} /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kinh phí</p>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(overview?.totalFunding || 0)}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Clock size={18} /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mốc tiếp theo</p>
            </div>
            <p className="text-sm font-bold text-foreground">{overview?.nextMilestone?.title || "—"}</p>
            <p className="text-xs text-destructive" style={{ fontVariantNumeric: "tabular-nums" }}>Còn {overview?.nextMilestone?.dueHours || 0}h</p>
          </CardContent>
        </Card>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pending Proposals */}
        <div className="lg:col-span-3">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border bg-surface-container flex justify-between items-center">
              <h2 className="font-semibold text-foreground">Đề xuất chờ xử lý</h2>
              <Button variant="ghost" size="sm" className="text-primary" asChild>
                <Link to="/proposals?status=SUBMITTED">Xem tất cả <ArrowRight size={14} className="ml-1" /></Link>
              </Button>
            </div>
            {pendingProposals.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Không có đề xuất nào chờ xử lý" description="Tất cả đề xuất đã được xử lý." />
            ) : (
              <div className="divide-y divide-border">
                {pendingProposals.map((p) => (
                  <Link key={p.id} to={`/proposals/${p.id}`} className="flex items-center gap-4 px-4 sm:px-6 py-3 hover:bg-surface-variant/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{p.titleVI}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.piName} — {p.hostingUnit}</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(p.totalBudget)}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions + Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Actions */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-foreground text-sm mb-3">Thao tác nhanh</h3>
              <Button variant="outline" className="w-full justify-start text-sm" asChild>
                <Link to="/proposals"><FileText size={14} className="mr-2" /> Quản lý đề xuất</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" asChild>
                <Link to="/meetings"><Users size={14} className="mr-2" /> Hội đồng xét duyệt</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" asChild>
                <Link to="/contracts"><BarChart3 size={14} className="mr-2" /> Hợp đồng & Giải ngân</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Activity */}
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
    </div>
  );
}
