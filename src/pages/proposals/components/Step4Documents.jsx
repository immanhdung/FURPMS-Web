import React, { useState } from "react";
import { useWizard } from "../../../components/forms/StepWizard";
import { useManageDocuments } from "../../../hooks/useProposals";
import { FileUploader } from "../../../components/forms/FileUploader";
import { Save } from "lucide-react";

export function Step4Documents({ proposalId, initialDocuments = [] }) {
  const { goNext, goBack } = useWizard();
  const { upload, remove } = useManageDocuments();
  
  const [documents, setDocuments] = useState(
    initialDocuments.map(doc => ({
      name: doc.fileName,
      size: 0, // Mock sizes for initial load
      status: "SUCCESS",
      id: doc.id,
      url: doc.fileUrl
    }))
  );

  const handleFilesChange = async (newFiles) => {
    // Only upload the newly added files (PENDING ones)
    const pendingFiles = newFiles.filter(f => f.status === "PENDING");
    
    // In a real implementation we'd loop through and upload them, setting status to UPLOADING then SUCCESS.
    // Here we'll just mock it.
    
    const uploadedFiles = [...documents];
    
    for (const f of pendingFiles) {
      if (proposalId) {
        try {
          const formData = new FormData();
          formData.append("file", f.file);
          formData.append("category", "OTHER");
          
          const result = await upload.mutateAsync({ id: proposalId, formData });
          
          uploadedFiles.push({
            name: result.fileName,
            size: f.size,
            status: "SUCCESS",
            id: result.id,
            url: result.fileUrl
          });
        } catch (e) {
          uploadedFiles.push({
            name: f.name,
            size: f.size,
            status: "ERROR"
          });
        }
      } else {
        // Mock success if no ID yet (e.g. testing UI)
        uploadedFiles.push({
          name: f.name,
          size: f.size,
          status: "SUCCESS",
          id: `mock-${Date.now()}`
        });
      }
    }
    
    setDocuments(uploadedFiles);
  };

  const handleRemove = async (indexToRemove) => {
    const doc = documents[indexToRemove];
    
    if (proposalId && doc.id && String(doc.id).indexOf("mock") === -1) {
      try {
        await remove.mutateAsync({ id: proposalId, docId: doc.id });
      } catch (e) {
        console.error("Failed to delete document", e);
        return; // Don't remove from UI if API failed
      }
    }
    
    setDocuments(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground">Tài liệu đính kèm</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tải lên các tài liệu liên quan đến đề xuất nghiên cứu.
        </p>
      </div>

      <div className="bg-surface/50 border border-border rounded-xl p-6 shadow-sm space-y-6">
        <FileUploader
          label="Tài liệu thuyết minh (PDF, DOCX)"
          description="Bản thuyết minh chi tiết theo biểu mẫu 01 (có chữ ký)."
          accept=".pdf,.doc,.docx"
          multiple={true}
          maxFiles={5}
          maxSize={15 * 1024 * 1024} // 15MB
          value={documents}
          onChange={handleFilesChange}
          onRemove={handleRemove}
        />
        
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-6">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Quy định nộp file:</h4>
          <ul className="text-sm text-blue-900/80 list-disc pl-4 space-y-1">
            <li>Tổng dung lượng các file không vượt quá 50MB.</li>
            <li>Tên file phải viết không dấu, không chứa ký tự đặc biệt (VD: ThuyetMinh_DeTai_ABC.pdf).</li>
            <li>Bản cứng cần được nộp về phòng QLKH trước ngày đóng chu kỳ.</li>
          </ul>
        </div>
      </div>

      <div className="pt-8 flex justify-between items-center border-t mt-8">
        <button 
          type="button"
          onClick={goBack}
          className="px-6 py-2.5 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
        >
          Quay lại
        </button>
        <button 
          type="button"
          onClick={goNext}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
        >
          <Save size={16} />
          Lưu và Tiếp tục
        </button>
      </div>
    </div>
  );
}
