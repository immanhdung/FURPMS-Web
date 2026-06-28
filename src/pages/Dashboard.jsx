import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileText, Play, Filter, ArrowUpDown, MoreVertical, Loader2 } from "lucide-react";
import { api } from "../api/axios";
import { LoadingState } from "../components/shared/LoadingState";
import { EmptyState } from "../components/shared/EmptyState";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, proposalsRes] = await Promise.all([
          api.get("/analytics/overview"),
          api.get("/proposals")
        ]);
        
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
        if (proposalsRes.data.success) {
          setProposals(proposalsRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const getStatusBadge = (status) => {
    const configs = {
      IN_PROGRESS:  { label: "Đang thực hiện",  color: "bg-blue-100 text-blue-700" },
      UNDER_REVIEW: { label: "Đang xét duyệt",  color: "bg-orange-100 text-orange-700" },
      COMPLETED:    { label: "Hoàn thành",       color: "bg-green-100 text-green-700" },
      DRAFT:        { label: "Bản nháp",         color: "bg-gray-100 text-gray-700" },
      APPROVED:     { label: "Đã duyệt",        color: "bg-green-100 text-green-700" },
    };
    const cfg = configs[status] || { label: status, color: "bg-gray-100 text-gray-700" };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.color}`}>{cfg.label}</span>;
  };

  if (loading) {
    return <LoadingState message="Đang tải dashboard…" />;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 motion-reduce:animate-none">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-tertiary/10 to-primary/5 rounded-xl p-4 sm:p-6 border border-border">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ textWrap: "balance" }}>Chào mừng trở lại, Dr. Nguyen.</h1>
        <p className="text-muted-foreground max-w-2xl mb-4">
          Hệ thống nghiên cứu đang hoạt động hiệu quả. Bạn có {analytics?.activeProposals || 0} đề xuất đang chờ xét duyệt.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link to="/proposals">
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" /> Xem đề xuất
            </Link>
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-surface-variant">
            Lịch mốc thời gian
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Đề xuất đang hoạt động</p>
            <p className="text-3xl sm:text-4xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{analytics?.activeProposals || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tổng kinh phí</p>
            <p className="text-3xl sm:text-4xl font-bold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(analytics?.totalFunding || 0)}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm relative overflow-hidden sm:col-span-2 md:col-span-1">
          <CardContent className="p-4 sm:p-6 z-10 relative">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mốc thời gian tiếp theo</p>
            <h2 className="text-lg font-bold text-foreground mt-1" style={{ textWrap: "balance" }}>{analytics?.nextMilestone?.title || "Không có"}</h2>
            <p className="text-sm font-medium text-destructive mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>Còn {analytics?.nextMilestone?.dueHours || 0} giờ</p>
          </CardContent>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none" aria-hidden="true">
             <Play size={120} className="text-destructive translate-x-10 translate-y-10" />
          </div>
        </Card>
      </div>

      {/* Recent Proposals Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-border bg-surface-container flex justify-between items-center">
          <h2 className="font-semibold text-foreground">Đề tài nghiên cứu của tôi</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" /> Lọc
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowUpDown className="h-4 w-4 mr-2" aria-hidden="true" /> Sắp xếp
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50 text-muted-foreground">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-semibold">Tên đề tài</th>
                <th className="px-4 sm:px-6 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 sm:px-6 py-3 font-semibold">Kinh phí</th>
                <th className="px-4 sm:px-6 py-3 font-semibold">Tiến độ</th>
                <th className="px-4 sm:px-6 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {proposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-surface-variant/30 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <p className="font-semibold text-foreground line-clamp-1">{proposal.titleVI}</p>
                    <p className="text-xs text-muted-foreground">ID: {proposal.id}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    {getStatusBadge(proposal.status)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 font-medium text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(proposal.budgetAmount)}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-surface-variant rounded-full h-2 min-w-[80px]" aria-hidden="true">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${proposal.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{proposal.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label={`Thao tác thêm cho ${proposal.titleVI}`}>
                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
              {proposals.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <EmptyState title="Chưa có đề xuất nào" description="Tạo đề xuất nghiên cứu mới để bắt đầu." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
