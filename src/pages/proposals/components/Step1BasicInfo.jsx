import React, { useState, useEffect } from "react";
import { FormField } from "../../../components/forms/FormField";
import { SelectField } from "../../../components/forms/SelectField";
import { RichTextArea } from "../../../components/forms/RichTextArea";
import { useCreateProposal, useUpdateProposal } from "../../../hooks/useProposals";
import { useWizard } from "../../../components/forms/StepWizard";
import { Info, Sparkles } from "lucide-react";

const MOCK_CYCLES = [
  { value: "5", label: "Đợt tuyển chọn 2026-A" },
  { value: "4", label: "Đợt tuyển chọn 2025-B" },
];

const MOCK_TRACKS = [
  { value: "1", label: "Khoa học Kỹ thuật" },
  { value: "2", label: "Công nghệ" },
  { value: "3", label: "Khoa học Xã hội" },
];

export function Step1BasicInfo({ proposalId, initialData, onSaved }) {
  const { goNext, isSaving } = useWizard();
  const createMutation = useCreateProposal();
  const updateMutation = useUpdateProposal();

  const [formData, setFormData] = useState({
    titleVI: "",
    titleEN: "",
    cycleId: "",
    trackId: "",
    durationMonths: 12,
    abstractVI: "",
    researchObjectives: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        titleVI: initialData.titleVI || "",
        titleEN: initialData.titleEN || "",
        cycleId: String(initialData.cycleId || ""),
        trackId: String(initialData.trackId || ""),
        durationMonths: initialData.durationMonths || 12,
        abstractVI: initialData.abstractVI || "",
        researchObjectives: initialData.researchObjectives || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.titleVI.trim()) newErrors.titleVI = "Tên tiếng Việt không được để trống";
    if (!formData.cycleId) newErrors.cycleId = "Vui lòng chọn đợt tài trợ";
    if (!formData.trackId) newErrors.trackId = "Vui lòng chọn lĩnh vực";
    if (!formData.abstractVI.trim()) newErrors.abstractVI = "Tóm tắt không được để trống";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndNext = async () => {
    if (!validate()) return;

    try {
      let savedData;
      if (proposalId) {
        savedData = await updateMutation.mutateAsync({ id: proposalId, payload: formData });
      } else {
        savedData = await createMutation.mutateAsync(formData);
      }
      onSaved(savedData.id, savedData);
      goNext();
    } catch (error) {
      console.error("Save failed", error);
      // Show global error via toast in a real app
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground">Thông tin chung</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Điền các thông tin cơ bản về đề xuất nghiên cứu (Biểu mẫu 01).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-5">
          <FormField
            label="Tên đề tài (Tiếng Việt)"
            name="titleVI"
            value={formData.titleVI}
            onChange={handleChange}
            error={errors.titleVI}
            required
            placeholder="Nhập tên đề tài bằng Tiếng Việt..."
          />
          
          <FormField
            label="Tên đề tài (Tiếng Anh)"
            name="titleEN"
            value={formData.titleEN}
            onChange={handleChange}
            placeholder="Nhập tên đề tài bằng Tiếng Anh (không bắt buộc)..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SelectField
              label="Đợt tài trợ"
              name="cycleId"
              value={formData.cycleId}
              onChange={handleChange}
              options={MOCK_CYCLES}
              error={errors.cycleId}
              required
            />
            <SelectField
              label="Lĩnh vực nghiên cứu"
              name="trackId"
              value={formData.trackId}
              onChange={handleChange}
              options={MOCK_TRACKS}
              error={errors.trackId}
              required
            />
          </div>

          <FormField
            label="Thời gian thực hiện (tháng)"
            name="durationMonths"
            type="number"
            min={3}
            max={36}
            value={formData.durationMonths}
            onChange={handleChange}
            required
          />

          <RichTextArea
            label="Tóm tắt đề xuất (Abstract)"
            name="abstractVI"
            value={formData.abstractVI}
            onChange={handleChange}
            error={errors.abstractVI}
            required
            maxLength={3000}
            helpText="Tóm tắt ngắn gọn mục tiêu, phương pháp và kết quả dự kiến."
          />

          <RichTextArea
            label="Mục tiêu nghiên cứu"
            name="researchObjectives"
            value={formData.researchObjectives}
            onChange={handleChange}
            maxLength={5000}
          />
          
          <div className="pt-4 flex justify-end">
             <button 
                type="button" 
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleSaveAndNext}
                disabled={isSaving || createMutation.isLoading || updateMutation.isLoading}
             >
                Lưu và Tiếp tục
             </button>
          </div>
        </div>

        {/* Right Column: AI Assistant & Guidelines */}
        <div className="space-y-5">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700 font-semibold mb-3">
              <Sparkles size={18} />
              <h3>AI Gợi ý tối ưu</h3>
            </div>
            <p className="text-sm text-blue-900/80 leading-relaxed">
              Tên đề tài nên chứa các từ khóa phản ánh đúng chuyên ngành. 
              Phần tóm tắt cần nêu bật được tính mới (novelty) để hội đồng dễ dàng đánh giá.
            </p>
            <button className="mt-4 text-xs font-medium text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors">
              Kiểm tra tính hợp lệ
            </button>
          </div>

          <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-foreground font-semibold mb-3">
              <Info size={18} className="text-muted-foreground" />
              <h3>Quy định (QĐ543)</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
              <li>Thời gian thực hiện tối đa không quá 24 tháng đối với cấp Cơ sở.</li>
              <li>Chủ nhiệm đề tài không được vi phạm tiến độ ở các chu kỳ trước.</li>
              <li>Nội dung không trùng lặp với các đề tài đã nghiệm thu.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
