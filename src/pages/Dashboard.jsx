import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileText, Play, Filter, ArrowUpDown, MoreVertical } from "lucide-react";
import { api } from "../api/axios";

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
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">In Progress</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">Under Review</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Completed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-tertiary/10 to-primary/5 rounded-xl p-6 border border-border">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Dr. Nguyen.</h1>
        <p className="text-muted-foreground max-w-2xl mb-4">
          Your research ecosystem is performing at optimal efficiency. You have {analytics?.activeProposals || 0} active proposals awaiting final review.
        </p>
        <div className="flex gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <FileText className="mr-2 h-4 w-4" /> Review Proposals
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-surface-variant">
            View Milestone Calendar
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Proposals</p>
            <h2 className="text-4xl font-bold text-foreground">{analytics?.activeProposals || 0}</h2>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Funding</p>
            <h2 className="text-4xl font-bold text-foreground">{formatCurrency(analytics?.totalFunding || 0)}</h2>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm relative overflow-hidden">
          <CardContent className="p-6 z-10 relative">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Next Milestone</p>
            <h3 className="text-lg font-bold text-foreground mt-1">{analytics?.nextMilestone?.title || "None"}</h3>
            <p className="text-sm font-medium text-destructive mt-1">Due in {analytics?.nextMilestone?.dueHours || 0} hours</p>
          </CardContent>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
             <Play size={120} className="text-destructive translate-x-10 translate-y-10" />
          </div>
        </Card>
      </div>

      {/* Recent Proposals Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface-container flex justify-between items-center">
          <h3 className="font-semibold text-foreground">My Research Projects</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowUpDown className="h-4 w-4 mr-2" /> Sort
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Project Title</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Funding</th>
                <th className="px-6 py-3 font-semibold">Progress</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {proposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-surface-variant/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">{proposal.titleVI}</p>
                    <p className="text-xs text-muted-foreground">ID: {proposal.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(proposal.status)}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {formatCurrency(proposal.budgetAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-surface-variant rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${proposal.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{proposal.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {proposals.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    No active proposals found.
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
