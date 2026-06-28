import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../../../components/forms/StepWizard";
import { useSubmitProposal } from "../../../hooks/useProposals";
import { CheckCircle2, AlertTriangle, FileText, Send } from "lucide-react";

export function Step5Submit({ proposalId, isCompleted = false }) {
  const { goBack } = useWizard();
  const navigate = useNavigate();
  const submitMutation = useSubmitProposal();
  
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async () => {
    if (!proposalId) {
      alert("Lỗi: Không tìm thấy ID đề xuất.");
      return;
    }
    
    if (!agreeTerms) {
      alert("Vui lòng đồng ý với cam kết trước khi nộp.");
      return;
    }

    try {
      await submitMutation.mutateAsync(proposalId);
      // Navigate to proposal list with success state (you can pass state to show a toast)
      navigate("/proposals", { state: { message: "Đã nộp đề xuất thành công!" } });
    } catch (error) {
      console.error("Lỗi nộp đề xuất", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center py-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <FileText size={32} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Xem lại và Nộp đề xuất</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Vui lòng kiểm tra kỹ tất cả các thông tin trước khi nộp. Sau khi nộp, bạn sẽ không thể tự chỉnh sửa đề xuất trừ khi được yêu cầu bổ sung.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Checklist */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-foreground border-b pb-2">Danh sách kiểm tra (Checklist)</h3>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm">
              <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground block">Thông tin chung (Step 1)</span>
                <span className="text-muted-foreground text-xs">Đã điền đủ tên, lĩnh vực và tóm tắt.</span>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground block">Nhân sự (Step 2)</span>
                <span className="text-muted-foreground text-xs">Đã có đủ thành viên và Chủ nhiệm (PI).</span>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground block">Ngân sách (Step 3)</span>
                <span className="text-muted-foreground text-xs">Đã lập dự toán chi tiết.</span>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground block">Tài liệu (Step 4)</span>
                <span className="text-muted-foreground text-xs">Đã đính kèm bản thuyết minh PDF.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Commitment */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-amber-800">Cam kết của Chủ nhiệm đề tài</h3>
              <p className="text-sm text-amber-900/80">
                Tôi xin cam đoan những thông tin trong hồ sơ là hoàn toàn trung thực. Đề tài này chưa từng được nhận tài trợ từ bất kỳ nguồn vốn ngân sách Nhà nước hay các quỹ tài trợ nào khác.
              </p>
              
              <label className="flex items-center gap-2 mt-4 pt-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-amber-900 group-hover:text-amber-700 transition-colors">
                  Tôi đã đọc và đồng ý với cam kết trên
                </span>
              </label>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-2xl mx-auto pt-8 flex justify-between items-center border-t mt-8">
        <button 
          type="button"
          onClick={goBack}
          className="px-6 py-2.5 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
          disabled={submitMutation.isLoading}
        >
          Quay lại
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          disabled={!agreeTerms || submitMutation.isLoading}
          className="bg-primary text-primary-foreground px-8 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitMutation.isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
          Nộp hồ sơ
        </button>
      </div>
    </div>
  );
}
