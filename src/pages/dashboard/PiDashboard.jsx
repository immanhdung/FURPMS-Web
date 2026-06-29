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
  PlusCircle,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatRelativeTime, getStatusConfig } from "../../lib/utils";

export default function PiDashboard({ user }) {
  const { data: overview, isLoading: loadingOverview } = useDashboardOverview();
  const { data: activityData, isLoading: loadingActivity } = useRecentActivity();
  const { data: proposalsData, isLoading: loadingProposals } = useProposals({ limit: 5 });

  const activities = activityData || [];
  const proposals = proposalsData?.data || [];

  if (loadingOverview) {
    return <LoadingState message="Đang tải dashboard…" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-tertiary/10 to-primary/5 rounded-xl p-4 sm:p-6 border border-border">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ textWrap: "balance" }}>
          Chào mừng trở lại, {user?.fullName || "Nhà nghiên cứu"}.
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-4">
          Bạn có {overview?.activeProposals || 0} đề xuất đang hoạt động.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link to="/proposals/new">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Tạo đề xuất mới
            </Link>
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-surface-variant" asChild>
            <Link to="/proposals">
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" /> Xem đề xuất
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileText size={20} /></div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Đề xuất hoạt động</p>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{overview?.activeProposals || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center"><TrendingUp size={20} /></div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tổng kinh phí</p>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(overview?.totalFunding || 0)}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm relative overflow-hidden sm:col-span-2 md:col-span-1">
          <CardContent className="p-4 sm:p-6 z-10 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Calendar size={20} /></div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mốc thời gian</p>
            </div>
            <h2 className="text-lg font-bold text-foreground mt-1" style={{ textWrap: "balance" }}>{overview?.nextMilestone?.title || "Không có"}</h2>
            <p className="text-sm font-medium text-destructive mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>Còn {overview?.nextMilestone?.dueHours || 0} giờ</p>
          </CardContent>
        </Card>
      </div>

      {/* 2-column: Recent Proposals + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Proposals */}
        <div className="lg:col-span-3">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border bg-surface-container flex justify-between items-center">
              <h2 className="font-semibold text-foreground">Đề xuất gần đây</h2>
              <Button variant="ghost" size="sm" className="text-primary" asChild>
                <Link to="/proposals">Xem tất cả <ArrowRight size={14} className="ml-1" /></Link>
              </Button>
            </div>
            {loadingProposals ? (
              <LoadingState message="Đang tải…" />
            ) : proposals.length === 0 ? (
              <EmptyState title="Chưa có đề xuất" description="Tạo đề xuất mới để bắt đầu." actionLabel="Tạo đề xuất" onAction={() => {}} />
            ) : (
              <div className="divide-y divide-border">
                {proposals.slice(0, 5).map((p) => {
                  const sc = getStatusConfig("proposal", p.status);
                  return (
                    <Link key={p.id} to={`/proposals/${p.id}`} className="flex items-center gap-4 px-4 sm:px-6 py-3 hover:bg-surface-variant/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{p.titleVI}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.piName}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap ${sc.color}`}>{sc.label}</span>
                      <span className="text-xs text-muted-foreground font-medium w-20 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(p.totalBudget)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <Card className="border-border shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-border bg-surface-container">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Bell size={16} aria-hidden="true" /> Hoạt động gần đây
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              {loadingActivity ? (
                <LoadingState message="Đang tải…" />
              ) : activities.length === 0 ? (
                <EmptyState title="Chưa có hoạt động" />
              ) : (
                <div className="space-y-4">
                  {activities.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                          <Clock size={10} aria-hidden="true" /> {formatRelativeTime(item.createdAt)}
                        </p>
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
