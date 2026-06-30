import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from "recharts";
import { AlertCircle, CheckCircle2, Save, FileSignature } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { LoadingState } from "../../../components/shared/LoadingState";
import { ConfirmDialog } from "../../../components/shared/ConfirmDialog";
import { 
  useCouncil, useAllScores, useMakeDecision, useRubric 
} from "../../../hooks/useCouncils";

const DECISION_OPTIONS = [
  { value: "APPROVED", label: "Đạt (Được duyệt)" },
  { value: "REVISION_REQUIRED", label: "Cần chỉnh sửa" },
  { value: "REJECTED", label: "Không đạt (Từ chối)" }
];

// Helper colors for grouped bar chart
const CHART_COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'];

export function DecisionPanel({ councilId }) {
  const { data: council, isLoading: loadingCouncil } = useCouncil(councilId);
  const { data: scores, isLoading: loadingScores } = useAllScores(councilId);
  const { data: rubric, isLoading: loadingRubric } = useRubric(council?.rubricId);
  const decisionMutation = useMakeDecision(councilId);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm({
    defaultValues: {
      result: "",
      councilComments: "",
      recommendations: ""
    }
  });

  const isLoading = loadingCouncil || loadingScores || loadingRubric;

  // ─── Computed Data ──────────────────────────────────────────────────
  const { 
    acceptedReviewers = [], 
    submittedScoresCount = 0, 
    isQuorumMet = false, 
    chartData = [],
    avgTotalScore = 0
  } = useMemo(() => {
    if (!council || !scores || !rubric) return {};

    const accepted = council.members?.filter(m => m.status === "ACCEPTED") || [];
    const submittedScores = scores.filter(s => s.submittedAt);
    
    // Quorum Guard
    const isQuorumMet = submittedScores.length > 0 && submittedScores.length >= accepted.length;

    // Divergence Chart Data
    let cData = [];
    if (rubric.criteria) {
      cData = rubric.criteria.map((c) => {
        const item = { subject: c.code, name: c.name };
        submittedScores.forEach((scoreObj, index) => {
          const reviewerName = `Reviewer ${index + 1}`; // Or we could match with accepted members to get real name
          item[reviewerName] = scoreObj.scores[c.id] || 0;
        });
        return item;
      });
    }

    // Average Total Score
    let avg = 0;
    if (submittedScores.length > 0) {
      const sum = submittedScores.reduce((acc, curr) => acc + curr.totalScore, 0);
      avg = (sum / submittedScores.length).toFixed(1);
    }

    return {
      acceptedReviewers: accepted,
      submittedScoresCount: submittedScores.length,
      isQuorumMet,
      chartData: cData,
      avgTotalScore: avg
    };
  }, [council, scores, rubric]);

  if (isLoading) return <LoadingState message="Đang tải dữ liệu tổng hợp..." />;
  if (!council) return null;

  const onPreSubmit = (data) => {
    setConfirmOpen(true);
  };

  const handleFinalDecision = async () => {
    const data = watch();
    await decisionMutation.mutateAsync({
      result: data.result,
      councilComments: data.councilComments,
      recommendations: data.recommendations
    });
    setConfirmOpen(false);
  };

  const reviewersKeys = chartData.length > 0 ? Object.keys(chartData[0]).filter(k => k !== 'subject' && k !== 'name') : [];

  return (
    <div className="space-y-6 mt-8 animate-in fade-in duration-500">
      
      {/* SECTION: SCORES OVERVIEW */}
      <Card className="border-border shadow-sm">
        <CardHeader className="bg-surface/30 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart className="w-5 h-5 text-primary" />
            Tổng hợp điểm số & Đánh giá mức độ đồng thuận
          </CardTitle>
          <CardDescription>
            Điểm số từ các thành viên hội đồng được trực quan hóa để dễ dàng đối chiếu.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-1 p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-center items-center text-center">
              <span className="text-sm font-medium text-muted-foreground uppercase mb-1">Điểm Trung Bình</span>
              <span className="text-5xl font-black text-primary">{avgTotalScore}</span>
              <span className="text-xs text-muted-foreground mt-2">Dựa trên {submittedScoresCount} phiếu điểm</span>
            </div>
            <div className="md:col-span-3 h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 'dataMax']} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    {reviewersKeys.map((key, idx) => (
                      <Bar 
                        key={key} 
                        dataKey={key} 
                        fill={CHART_COLORS[idx % CHART_COLORS.length]} 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-border rounded-xl text-muted-foreground bg-slate-50/50">
                  Chưa có dữ liệu biểu đồ
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION: DECISION FORM */}
      <Card className="border-border shadow-md border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            <FileSignature className="w-5 h-5" />
            Biên bản Quyết định Hội đồng
          </CardTitle>
          <CardDescription>
            Admin/Staff thay mặt hội đồng nhập biên bản kết luận chính thức.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          
          {/* QUORUM GUARD ALERT */}
          {!isQuorumMet ? (
            <div className="mb-6 p-4 rounded-lg bg-destructive/5 border border-destructive/20 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-destructive">Chưa thu đủ phiếu điểm!</h5>
                <p className="text-sm text-destructive mt-1">
                  Hội đồng có {acceptedReviewers.length} thành viên tham gia, nhưng hệ thống mới ghi nhận {submittedScoresCount} phiếu điểm. <br/>
                  Bạn không thể chốt quyết định cho đến khi tất cả thành viên hoàn tất việc chấm điểm.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex gap-3 items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-green-800">Đã thu đủ phiếu điểm</h5>
                <p className="text-sm text-green-700 mt-1">
                  Tất cả {submittedScoresCount}/{acceptedReviewers.length} thành viên đã nộp phiếu. Bạn có thể tiến hành chốt kết quả.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onPreSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Kết luận (Decision) <span className="text-destructive">*</span></label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("result", { required: true })}
                >
                  <option value="" disabled>-- Chọn kết luận --</option>
                  {DECISION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nhận xét chung của hội đồng <span className="text-destructive">*</span></label>
              <Textarea 
                placeholder="Tóm tắt các điểm thống nhất của hội đồng..."
                className="min-h-[100px]"
                {...register("councilComments", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kiến nghị / Đề xuất (Tùy chọn)</label>
              <Textarea 
                placeholder="Các kiến nghị chỉnh sửa (nếu có)..."
                className="min-h-[80px]"
                {...register("recommendations")}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={!isQuorumMet || decisionMutation.isPending || council.status === "DECIDED"}
                variant="destructive"
                className="min-w-[200px]"
              >
                <FileSignature size={16} className="mr-2" />
                {decisionMutation.isPending ? "Đang xử lý..." : "Chốt Quyết Định"}
              </Button>
            </div>
          </form>

        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFinalDecision}
        title="Xác nhận chốt sổ Hội đồng"
        description="Hành động này sẽ KẾT THÚC phiên họp hội đồng và chốt kết quả Đề cương vĩnh viễn. Không thể sửa đổi điểm số hay quyết định sau khi đã xác nhận."
        confirmLabel="ĐỒNG Ý CHỐT SỔ"
        cancelLabel="Quay lại"
        variant="danger"
        requireInput={true}
        expectedInput="XAC NHAN"
        isLoading={decisionMutation.isPending}
      />
    </div>
  );
}
