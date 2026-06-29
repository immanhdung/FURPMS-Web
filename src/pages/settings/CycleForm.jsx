import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FormField } from "../../components/forms/FormField";
import { SelectField } from "../../components/forms/SelectField";
import { LoadingState } from "../../components/shared/LoadingState";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { useCycle, useCreateCycle, useUpdateCycle, useTracks } from "../../hooks/useCycles";
import { formatDate } from "../../lib/utils";
import {
  ArrowLeft,
  Save,
  Calendar,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────
// Timeline Helper for Preview
// ────────────────────────────────────────────────────────────────────────
function CycleTimelinePreview({ startDate, endDate }) {
  if (!startDate || !endDate) {
    return (
      <div className="h-2 w-full bg-surface-variant rounded-full mt-2" />
    );
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  let progress = 0;
  if (now > end) progress = 100;
  else if (now > start) {
    progress = Math.round(((now - start) / (end - start)) * 100);
  }

  return (
    <div className="space-y-1.5 mt-3">
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>{formatDate(startDate)}</span>
        <span>{formatDate(endDate)}</span>
      </div>
      <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 bg-primary"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Form
// ────────────────────────────────────────────────────────────────────────
export default function CycleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Data Hooks
  const { data: existingCycle, isLoading: isLoadingCycle } = useCycle(isEditMode ? id : null);
  const { data: allTracks = [] } = useTracks();
  const createMutation = useCreateCycle();
  const updateMutation = useUpdateCycle();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    description: "",
    researchTypeId: "1",
    submissionDeadline: "",
    reviewDeadline: "",
    trackIds: [],
  });

  const [errors, setErrors] = useState({});

  // Pre-fill
  useEffect(() => {
    if (existingCycle && isEditMode) {
      setFormData({
        name: existingCycle.name || "",
        year: existingCycle.year ? String(existingCycle.year) : "",
        description: existingCycle.description || "",
        researchTypeId: existingCycle.researchTypeId ? String(existingCycle.researchTypeId) : "",
        submissionDeadline: existingCycle.submissionDeadline ? existingCycle.submissionDeadline.split("T")[0] : "",
        reviewDeadline: existingCycle.reviewDeadline ? existingCycle.reviewDeadline.split("T")[0] : "",
        trackIds: existingCycle.tracks ? existingCycle.tracks.map(t => t.id) : [],
      });
    }
  }, [existingCycle, isEditMode]);

  // Data Integrity Rule: Lock core fields if NOT planning
  const isLocked = isEditMode && existingCycle?.status !== "PLANNING";

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleTrack = (trackId) => {
    setFormData((prev) => ({
      ...prev,
      trackIds: prev.trackIds.includes(trackId)
        ? prev.trackIds.filter((id) => id !== trackId)
        : [...prev.trackIds, trackId],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên chu kỳ.";
    if (!formData.year) newErrors.year = "Vui lòng nhập năm.";
    if (!formData.submissionDeadline) newErrors.submissionDeadline = "Vui lòng chọn hạn chót nộp hồ sơ.";
    if (!formData.reviewDeadline) newErrors.reviewDeadline = "Vui lòng chọn hạn chót xét duyệt.";

    if (formData.submissionDeadline && formData.reviewDeadline) {
      if (new Date(formData.submissionDeadline) >= new Date(formData.reviewDeadline)) {
        newErrors.reviewDeadline = "Hạn chót xét duyệt phải sau hạn chót nộp hồ sơ.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      year: Number(formData.year),
      researchTypeId: Number(formData.researchTypeId),
      // In real app, date should be converted to full ISO string based on timezone EOD
      submissionDeadline: `${formData.submissionDeadline}T23:59:59Z`,
      reviewDeadline: `${formData.reviewDeadline}T23:59:59Z`,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate("/settings/cycles");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingCycle) {
    return <LoadingState message="Đang tải thông tin chu kỳ…" />;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground shrink-0"
          onClick={() => navigate("/settings/cycles")}
          aria-label="Quay lại danh sách"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditMode ? "Chỉnh sửa Chu kỳ tài trợ" : "Tạo Chu kỳ tài trợ mới"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEditMode
              ? `Đang chỉnh sửa: ${existingCycle?.name || ""}`
              : "Thiết lập các thông số cơ bản cho đợt nhận hồ sơ mới."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── Left Column: Form ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Data Integrity Alert */}
            {isLocked && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="shrink-0 mt-0.5 text-orange-600" size={18} />
                <div className="text-sm">
                  <p className="font-bold mb-1">Dữ liệu đã khóa (Data Integrity Protection)</p>
                  <p>
                    Chu kỳ này đang ở trạng thái <strong>{existingCycle.status}</strong>. 
                    Để đảm bảo tính nhất quán của hệ thống, bạn không thể thay đổi thông tin cốt lõi (Năm, Loại hình, Hạn chót) 
                    khi đợt tài trợ đã bắt đầu. Chỉ cho phép sửa Mô tả và Lĩnh vực (Tracks).
                  </p>
                </div>
              </div>
            )}

            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar size={16} className="text-primary" /> Thông tin cơ bản
                </h3>

                <FormField
                  label="Tên đợt tài trợ"
                  required
                  placeholder="VD: Đợt tài trợ Mùa Xuân 2026"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  error={errors.name}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Năm thực hiện"
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => updateField("year", e.target.value)}
                    error={errors.year}
                    disabled={isLocked}
                    className={isLocked ? "bg-muted cursor-not-allowed" : ""}
                  />
                  <SelectField
                    label="Loại hình nghiên cứu"
                    required
                    value={formData.researchTypeId}
                    onChange={(e) => updateField("researchTypeId", e.target.value)}
                    disabled={isLocked}
                    className={isLocked ? "bg-muted cursor-not-allowed" : ""}
                    options={[
                      { value: "1", label: "Nghiên cứu cơ bản" },
                      { value: "2", label: "Nghiên cứu ứng dụng" },
                      { value: "3", label: "Nghiên cứu liên ngành" },
                      { value: "4", label: "Phục vụ cộng đồng" },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    Mô tả ngắn
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Mục tiêu và định hướng của đợt tài trợ này..."
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timelines */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Clock size={16} className="text-primary" /> Thời hạn (Deadlines)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Hạn chót nộp hồ sơ (Submission)"
                    type="date"
                    required
                    value={formData.submissionDeadline}
                    onChange={(e) => updateField("submissionDeadline", e.target.value)}
                    error={errors.submissionDeadline}
                    disabled={isLocked}
                    className={isLocked ? "bg-muted cursor-not-allowed" : ""}
                  />
                  <FormField
                    label="Hạn chót xét duyệt (Review)"
                    type="date"
                    required
                    value={formData.reviewDeadline}
                    onChange={(e) => updateField("reviewDeadline", e.target.value)}
                    error={errors.reviewDeadline}
                    disabled={isLocked} // Allow review deadline to be updated? The plan says "thông tin cốt lõi (Năm, Loại hình, Hạn chót)", usually submission deadline is hard locked, but review deadline could be extended. Let's lock both for strict integrity as per plan.
                    className={isLocked ? "bg-muted cursor-not-allowed" : ""}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tracks */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Layers size={16} className="text-primary" /> Lĩnh vực thuộc chu kỳ (Tracks)
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chọn các lĩnh vực nghiên cứu (Tracks) sẽ được nhận hồ sơ trong đợt tài trợ này.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {allTracks.map((track) => {
                    const isSelected = formData.trackIds.includes(track.id);
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => toggleTrack(track.id)}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30 hover:bg-surface-variant/30"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input bg-background"
                          }`}
                        >
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{track.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {track.ownerName ? `Phụ trách: ${track.ownerName}` : "Chưa có người phụ trách"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" aria-hidden="true" />
                )}
                {isEditMode ? "Lưu thay đổi" : "Tạo đợt tài trợ"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/settings/cycles")}
                disabled={isSaving}
              >
                Hủy
              </Button>
            </div>
          </div>

          {/* ── Right Column: Preview Card ── */}
          <div>
            <div className="sticky top-6">
              <Card className="border-border shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Card Preview
                  </h3>
                  
                  <div className="border border-border rounded-xl p-4 bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                        {formData.year || "202X"}
                      </span>
                      <StatusBadge type="cycle" status={existingCycle?.status || "PLANNING"} />
                    </div>
                    
                    <h2 className="text-lg font-bold text-foreground line-clamp-2 min-h-[1.75rem]">
                      {formData.name || "Tên đợt tài trợ..."}
                    </h2>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2 min-h-[2.5rem]">
                      {formData.description || "Mô tả đợt tài trợ sẽ hiển thị tại đây."}
                    </p>

                    {/* Fake Metrics */}
                    <div className="grid grid-cols-2 gap-3 mt-4 mb-4 p-3 rounded-lg bg-surface-container-low border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Số đề xuất</p>
                        <p className="text-sm font-semibold text-foreground">
                          {existingCycle?.proposalCount || 0} hồ sơ
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Kinh phí</p>
                        <p className="text-sm font-semibold text-green-700">
                          {existingCycle?.totalFunding ? "Đã cấp" : "Chưa cấp"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <CycleTimelinePreview 
                        startDate={formData.submissionDeadline ? new Date(new Date(formData.submissionDeadline).getTime() - 30*24*60*60*1000).toISOString() : null}
                        endDate={formData.submissionDeadline ? `${formData.submissionDeadline}T23:59:59Z` : null}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
        </div>
      </form>
    </div>
  );
}
