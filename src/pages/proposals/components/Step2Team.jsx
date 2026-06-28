import React, { useState } from "react";
import { FormField } from "../../../components/forms/FormField";
import { SelectField } from "../../../components/forms/SelectField";
import { useManageTeamMembers } from "../../../hooks/useProposals";
import { useWizard } from "../../../components/forms/StepWizard";
import { Users, Plus, Trash2, Edit2, ShieldAlert } from "lucide-react";
import { cn } from "../../../lib/utils";

const ROLE_TYPES = [
  { value: "CHAIR", label: "Chủ nhiệm đề tài (PI)" },
  { value: "SECRETARY", label: "Thư ký khoa học" },
  { value: "MEMBER", label: "Thành viên nghiên cứu" },
  { value: "TECHNICIAN", label: "Kỹ thuật viên" },
];

export function Step2Team({ proposalId, initialTeam = [] }) {
  const { goNext, goBack } = useWizard();
  const { addMember, updateMember, removeMember } = useManageTeamMembers();
  
  const [team, setTeam] = useState(initialTeam);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    fullName: "",
    email: "",
    roleType: "MEMBER",
    workMonths: "",
    unitName: "",
  });

  const resetForm = () => {
    setFormData({ id: null, fullName: "", email: "", roleType: "MEMBER", workMonths: "", unitName: "" });
    setIsEditing(false);
  };

  const handleEdit = (member) => {
    setFormData({
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      roleType: member.roleType,
      workMonths: member.workMonths || "",
      unitName: member.unitName || "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    
    // Optimistic update for UI feel (if real backend, await mutation)
    setTeam(prev => prev.filter(m => m.id !== memberId));
    
    if (proposalId && String(memberId).indexOf('temp') === -1) {
      try {
        await removeMember.mutateAsync({ id: proposalId, memberId });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    const payload = {
      ...formData,
      isPi: formData.roleType === "CHAIR",
      isSecretary: formData.roleType === "SECRETARY",
    };

    if (isEditing) {
      setTeam(prev => prev.map(m => m.id === formData.id ? { ...m, ...payload } : m));
      if (proposalId && String(formData.id).indexOf('temp') === -1) {
        updateMember.mutate({ id: proposalId, memberId: formData.id, payload });
      }
    } else {
      const newMember = { ...payload, id: `temp-${Date.now()}` };
      setTeam(prev => [...prev, newMember]);
      if (proposalId) {
        addMember.mutate({ id: proposalId, payload });
      }
    }
    
    resetForm();
  };

  const hasPI = team.some(m => m.roleType === "CHAIR" || m.isPi);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-foreground">Nhân sự nghiên cứu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Thiết lập danh sách thành viên tham gia thực hiện đề tài.
          </p>
        </div>
        
        {!hasPI && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
            <ShieldAlert size={18} />
            <span className="text-sm font-medium">Chưa có Chủ nhiệm đề tài (PI)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="bg-surface/50 border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground mb-4">
              {isEditing ? "Cập nhật thành viên" : "Thêm thành viên mới"}
            </h3>
            
            <FormField
              label="Họ và tên"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              required
            />
            
            <FormField
              label="Email (FPT)"
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
            
            <SelectField
              label="Vai trò"
              options={ROLE_TYPES}
              value={formData.roleType}
              onChange={e => setFormData({...formData, roleType: e.target.value})}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Số tháng làm việc"
                type="number"
                min={0}
                max={36}
                value={formData.workMonths}
                onChange={e => setFormData({...formData, workMonths: e.target.value})}
              />
              <FormField
                label="Đơn vị công tác"
                value={formData.unitName}
                onChange={e => setFormData({...formData, unitName: e.target.value})}
              />
            </div>
            
            <div className="pt-2 flex gap-3">
              {isEditing && (
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-md text-sm font-medium transition-colors">
                  Hủy
                </button>
              )}
              <button 
                type="submit" 
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm",
                  isEditing ? "flex-1 bg-primary text-primary-foreground hover:bg-primary/90" : "w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                )}
              >
                {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                {isEditing ? "Cập nhật" : "Thêm vào danh sách"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Cards List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-foreground">Danh sách thành viên ({team.length})</h3>
          </div>
          
          {team.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
              <Users size={48} className="mb-4 opacity-20" />
              <p>Chưa có thành viên nào.</p>
              <p className="text-sm">Hãy thêm thành viên từ biểu mẫu bên trái.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
              {team.map((member) => (
                <div key={member.id} className="group flex flex-col bg-card border rounded-lg p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-primary/40">
                  <div className="absolute top-0 left-0 w-1 h-full bg-sidebar-primary/20 group-hover:bg-sidebar-primary transition-colors" />
                  
                  <div className="flex justify-between items-start mb-2">
                    <div className="truncate font-semibold text-foreground pl-2">{member.fullName}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => handleEdit(member)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" aria-label="Sửa">
                        <Edit2 size={14} />
                      </button>
                      <button type="button" onClick={() => handleDelete(member.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" aria-label="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pl-2 space-y-1 text-sm text-muted-foreground">
                    <p className="truncate" title={member.email}>{member.email}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        member.roleType === "CHAIR" || member.isPi ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {ROLE_TYPES.find(r => r.value === member.roleType)?.label || member.roleType}
                      </span>
                      <span className="text-xs">{member.workMonths ? `${member.workMonths} tháng` : '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
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
              onClick={() => {
                if (!hasPI) {
                  alert("Đề tài bắt buộc phải có Chủ nhiệm (PI).");
                  return;
                }
                goNext();
              }}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Tiếp tục
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
