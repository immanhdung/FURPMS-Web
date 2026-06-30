import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useWatch, Controller } from "react-hook-form";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from "recharts";
import { 
  ArrowLeft, FileText, CheckCircle2, AlertTriangle, 
  Sparkles, Save, Info, Check, Lock, ChevronDown, ChevronUp
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingState } from "../../components/shared/LoadingState";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { 
  useCouncil, useRubrics, useMyScore, useSubmitScore 
} from "../../hooks/useCouncils";
import { toast } from "sonner";

// ────────────────────────────────────────────────────────────────────────
// 1. PdfViewer (Memoized to prevent Re-render Hell)
// ────────────────────────────────────────────────────────────────────────
const PdfViewer = React.memo(({ url, title }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
      <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <FileText size={16} className="text-blue-400" />
          {title || "Thuyết minh đề cương (PDF)"}
        </span>
        <Badge variant="outline" className="border-slate-600 text-slate-300">Read-only</Badge>
      </div>
      <div className="flex-1 w-full bg-slate-800/50 flex items-center justify-center p-4">
        {/* Placeholder instead of heavy react-pdf library to prevent build issues */}
        {url ? (
          <iframe 
            src={url} 
            title="PDF Document" 
            className="w-full h-full rounded bg-white"
            loading="lazy"
          />
        ) : (
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FileText size={32} className="text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm">
              Trình đọc PDF đang được nhúng bằng iframe tĩnh để tối ưu hiệu năng theo cấu trúc Split-screen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
PdfViewer.displayName = "PdfViewer";


// ────────────────────────────────────────────────────────────────────────
// 2. Chart Component
// ────────────────────────────────────────────────────────────────────────
const RubricRadarChart = ({ criteria, watchScores }) => {
  const chartData = criteria.map((c) => {
    // watchScores is an object mapped by criterion code or id. Let's use id.
    const given = watchScores?.[c.id] || 0;
    return {
      subject: c.code,
      name: c.name,
      A: Number(given) || 0,
      fullMark: c.max_score,
    };
  });

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
          <Radar
            name="Điểm đánh giá"
            dataKey="A"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.4}
            animationDuration={300}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};


// ────────────────────────────────────────────────────────────────────────
// 3. Main Scoring Workspace Component
// ────────────────────────────────────────────────────────────────────────
export default function ScoringWorkspace() {
  const { id: councilId } = useParams();
  const navigate = useNavigate();

  // API Hooks
  const { data: council, isLoading: loadingCouncil } = useCouncil(councilId);
  const { data: rubrics, isLoading: loadingRubrics } = useRubrics();
  const { data: myScore, isLoading: loadingMyScore } = useMyScore(councilId);
  const submitScoreMutation = useSubmitScore(councilId);

  // Form State
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      scores: {},
      comments: {},
      generalComments: ""
    }
  });

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState(null);
  
  // UI State for Responsive Tabs
  const [activeTab, setActiveTab] = useState("FORM"); // "DOC" or "FORM" (only used on mobile)

  // Derived Data
  const rubricTemplate = useMemo(() => {
    if (!rubrics || !council) return null;
    return rubrics.find(r => r.dimension === council.dimension) || rubrics[0];
  }, [rubrics, council]);

  // Sync Form with myScore (Read-only mode)
  const isReadOnly = !!myScore;
  
  useEffect(() => {
    if (myScore && rubricTemplate) {
      const scoresObj = {};
      const commentsObj = {};
      myScore.scoreDetails?.forEach(sd => {
        scoresObj[sd.criterionId] = sd.givenScore;
        commentsObj[sd.criterionId] = sd.comments;
      });
      setValue("scores", scoresObj);
      setValue("comments", commentsObj);
      setValue("generalComments", myScore.generalComments || "");
    }
  }, [myScore, rubricTemplate, setValue]);

  // ─── Real-time Watchers for Chart & Total (Performance Architecture) ───
  const watchScores = watch("scores");
  const currentTotal = useMemo(() => {
    if (!watchScores) return 0;
    return Object.values(watchScores).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }, [watchScores]);
  
  const isOverMax = rubricTemplate && currentTotal > rubricTemplate.maxTotalScore;

  // ─── Actions ──────────────────────────────────────────────────────────
  const onPreSubmit = (data) => {
    if (isOverMax) {
      toast.error(`Tổng điểm (${currentTotal}) vượt quá mức tối đa cho phép (${rubricTemplate.maxTotalScore}).`);
      return;
    }
    setFormDataToSubmit(data);
    setConfirmSubmitOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!formDataToSubmit || !rubricTemplate) return;
    
    // Transform to API format
    const scoreDetails = rubricTemplate.criteria.map(c => ({
      criterionId: c.id,
      givenScore: Number(formDataToSubmit.scores[c.id]) || 0,
      comments: formDataToSubmit.comments[c.id] || ""
    }));

    const payload = {
      templateId: rubricTemplate.id,
      totalScore: currentTotal,
      generalComments: formDataToSubmit.generalComments,
      scoreDetails
    };

    try {
      await submitScoreMutation.mutateAsync(payload);
      setConfirmSubmitOpen(false);
      // It will auto switch to read-only due to cache invalidation in hook
    } catch (e) {
      // hook handles toast
    }
  };

  const handleAISuggestion = (criterionId, criterionName) => {
    // Mock AI Generation
    toast.info("Đang tạo nhận xét bằng AI...");
    setTimeout(() => {
      const mockText = `Phần "${criterionName}" được trình bày khá chi tiết. Đề cương nêu rõ được các luận điểm cốt lõi, tuy nhiên cần bổ sung thêm số liệu minh họa thực tế để tăng tính thuyết phục.`;
      setValue(`comments.${criterionId}`, mockText, { shouldDirty: true });
      toast.success("AI đã tạo gợi ý nhận xét thành công.");
    }, 800);
  };

  // ─── Loading States ──────────────────────────────────────────────────
  if (loadingCouncil || loadingRubrics || loadingMyScore) {
    return <LoadingState message="Đang tải Không gian chấm điểm..." />;
  }
  if (!council || !rubricTemplate) {
    return <div className="p-8 text-center">Lỗi: Không tìm thấy dữ liệu Hội đồng hoặc Biểu mẫu.</div>;
  }

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden animate-in fade-in duration-500 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-1" /> Quay lại
          </Button>
          <div className="h-6 w-px bg-border mx-2 hidden sm:block"></div>
          <div>
            <h1 className="text-lg font-bold text-foreground line-clamp-1">Chấm điểm: {council.proposalTitle}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vòng {council.roundNumber} • Biểu mẫu: {rubricTemplate.name}
            </p>
          </div>
        </div>
        
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-surface-variant p-1 rounded-lg">
          <Button 
            size="sm" 
            variant={activeTab === "DOC" ? "default" : "ghost"} 
            className="text-xs px-3 h-7"
            onClick={() => setActiveTab("DOC")}
          >
            Đề cương
          </Button>
          <Button 
            size="sm" 
            variant={activeTab === "FORM" ? "default" : "ghost"} 
            className="text-xs px-3 h-7"
            onClick={() => setActiveTab("FORM")}
          >
            Phiếu điểm
          </Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Column: PDF Viewer (Hidden on mobile if FORM tab active) */}
        <div className={`w-full lg:w-[45%] xl:w-1/2 h-full flex flex-col ${activeTab === "FORM" ? "hidden lg:flex" : "flex"}`}>
          <PdfViewer title={`Thuyết minh Đề cương - ${council.proposalTitle}`} />
        </div>

        {/* Right Column: Scoring Form (Hidden on mobile if DOC tab active) */}
        <div className={`w-full lg:w-[55%] xl:w-1/2 h-full flex flex-col rounded-xl border border-border shadow-sm overflow-hidden bg-background ${activeTab === "DOC" ? "hidden lg:flex" : "flex"}`}>
          
          <form onSubmit={handleSubmit(onPreSubmit)} className="flex flex-col h-full w-full">
            
            {/* Top Compact Summary Header (Always visible) */}
            <div className="flex-shrink-0 bg-surface/30 border-b border-border px-6 py-3 flex items-center justify-between shadow-sm z-20">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Tổng điểm tạm tính</span>
                <div className={`text-4xl font-black tracking-tighter ${isOverMax ? "text-destructive" : "text-primary"}`}>
                  {currentTotal}
                  <span className="text-2xl text-muted-foreground font-medium">/{rubricTemplate.maxTotalScore}</span>
                </div>
                {isOverMax && (
                  <span className="text-xs text-destructive font-medium mt-1 flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full w-fit">
                    <AlertTriangle size={12} /> Vượt giới hạn!
                  </span>
                )}
              </div>
              <div className="w-[120px] h-[100px] sm:w-[140px] sm:h-[120px] -mr-4">
                <RubricRadarChart criteria={rubricTemplate.criteria} watchScores={watchScores} />
              </div>
            </div>

            {/* Scrollable Criteria Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {isReadOnly && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 shadow-sm">
                  <CheckCircle2 className="text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800">Bạn đã nộp phiếu điểm</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Phiếu điểm đã được nộp lúc {new Date(myScore.submittedAt).toLocaleString("vi-VN")}. 
                      Chế độ Read-only đã được kích hoạt.
                    </p>
                  </div>
                </div>
              )}

              {/* Criteria List */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full"></div>
                  Chi tiết đánh giá
                </h3>
                
                {rubricTemplate.criteria.map((c) => {
                  const currentVal = Number(watchScores?.[c.id]) || 0;
                  const isError = currentVal > c.max_score || currentVal < 0;
                  const progressPct = Math.min(100, Math.max(0, (currentVal / c.max_score) * 100));
                  
                  return (
                    <Card key={c.id} className={`border transition-colors ${isError ? "border-destructive shadow-sm shadow-destructive/20" : "border-border shadow-sm hover:border-primary/30"}`}>
                      <CardHeader className="py-3 px-4 bg-surface/30 border-b border-border/50 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-semibold flex gap-2">
                          <Badge variant="outline" className="bg-background">{c.code}</Badge>
                          {c.name}
                        </CardTitle>
                        <div className="text-xs font-semibold text-muted-foreground bg-surface-variant px-2 py-1 rounded">
                          Tối đa: {c.max_score} đ
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        
                        {/* Score Input */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 shrink-0">
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Điểm số</label>
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                max={c.max_score}
                                step="0.5"
                                disabled={isReadOnly}
                                className={`text-lg font-bold pr-8 ${isError ? "border-destructive text-destructive focus-visible:ring-destructive" : ""}`}
                                {...register(`scores.${c.id}`, { 
                                  required: true, 
                                  min: 0, 
                                  max: c.max_score,
                                  valueAsNumber: true
                                })}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">đ</span>
                            </div>
                          </div>
                          <div className="flex-1 pt-6">
                            {/* Mini Progress Bar */}
                            <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${isError ? 'bg-destructive' : progressPct > 80 ? 'bg-green-500' : progressPct > 40 ? 'bg-blue-500' : 'bg-orange-400'}`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            {isError && <p className="text-xs text-destructive mt-1.5">Vượt quá điểm tối đa ({c.max_score})!</p>}
                          </div>
                        </div>

                        {/* Comments Input */}
                        <div className="space-y-2 pt-2 border-t border-border/30">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-foreground">Nhận xét tiêu chí (Tùy chọn)</label>
                            {!isReadOnly && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[11px] text-fpt-orange hover:text-fpt-orange hover:bg-fpt-orange/10"
                                onClick={() => handleAISuggestion(c.id, c.name)}
                              >
                                <Sparkles size={12} className="mr-1" /> Gợi ý AI
                              </Button>
                            )}
                          </div>
                          <Textarea 
                            disabled={isReadOnly}
                            placeholder={`Viết nhận xét cụ thể cho tiêu chí "${c.name}"...`}
                            className="min-h-[80px] text-sm resize-y"
                            {...register(`comments.${c.id}`)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* General Comments */}
              <div className="space-y-3 pt-4">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full"></div>
                  Nhận xét chung & Kết luận
                </h3>
                <Textarea 
                  disabled={isReadOnly}
                  placeholder="Đánh giá tổng quan về đề cương, các điểm mạnh, điểm yếu lớn nhất và kết luận kiến nghị của hội đồng..."
                  className="min-h-[120px] text-sm leading-relaxed"
                  {...register("generalComments")}
                />
              </div>
            </div>

            {/* Fixed Footer Actions */}
            <div className="flex-shrink-0 bg-card border-t border-border p-4 flex justify-end gap-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {!isReadOnly ? (
                <>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Hủy & Quay lại
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isOverMax || submitScoreMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
                  >
                    <Save size={16} className="mr-2" />
                    Nộp phiếu điểm
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => navigate(-1)} className="min-w-[140px]">
                  <ArrowLeft size={16} className="mr-2" />
                  Quay lại Bảng điều khiển
                </Button>
              )}
            </div>

          </form>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      <ConfirmDialog
        open={confirmSubmitOpen}
        onOpenChange={setConfirmSubmitOpen}
        title="Xác nhận nộp phiếu điểm"
        description={
          <span className="block space-y-2 mt-2">
            <span className="block">Bạn đang chuẩn bị nộp phiếu điểm với tổng <b>{currentTotal}/{rubricTemplate?.maxTotalScore}</b> điểm.</span>
            <span className="block text-destructive font-medium text-sm">Lưu ý: Hành động này KHÔNG THỂ hoàn tác. Sau khi nộp, phiếu điểm sẽ bị khóa (Read-only).</span>
          </span>
        }
        confirmLabel="Xác nhận nộp"
        onConfirm={handleFinalSubmit}
        variant="default"
      />
    </div>
  );
}
