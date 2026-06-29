import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FormField } from "../../components/forms/FormField";
import { SelectField } from "../../components/forms/SelectField";
import { useUser, useCreateUser, useUpdateUser } from "../../hooks/useUsers";
import { LoadingState } from "../../components/shared/LoadingState";
import { ROLE_OPTIONS, MOCK_UNITS, ACADEMIC_DEGREES } from "../../mocks/userMocks";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Shield,
  Key,
  Globe,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────
// Role badge for preview
// ────────────────────────────────────────────────────────────────────────
const ROLE_BADGE = {
  Admin: { label: "Admin", color: "bg-violet-100 text-violet-700" },
  Staff: { label: "QLKH", color: "bg-blue-100 text-blue-700" },
  Faculty: { label: "Giảng viên", color: "bg-green-100 text-green-700" },
  PI: { label: "PI", color: "bg-amber-100 text-amber-700" },
  ReviewCommittee: { label: "Hội đồng", color: "bg-red-100 text-red-600" },
};

// ────────────────────────────────────────────────────────────────────────
// Preview Card (right column)
// ────────────────────────────────────────────────────────────────────────
function UserPreviewCard({ formData }) {
  const initials = formData.fullName
    ? formData.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "?";

  const degree = ACADEMIC_DEGREES.find((d) => d.value === Number(formData.academicDegree));
  const unit = MOCK_UNITS.find((u) => u.id === Number(formData.unitId));

  return (
    <Card className="border-border shadow-sm sticky top-6">
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Xem trước
        </h3>

        {/* Avatar */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
            {initials}
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">
              {formData.fullName || "Họ và tên"}
            </p>
            <p className="text-sm text-muted-foreground">
              {formData.email || "email@fpt.edu.vn"}
            </p>
          </div>
        </div>

        {/* Info items */}
        <div className="space-y-2.5 text-sm pt-2 border-t border-border">
          {formData.phoneNumber && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={14} className="shrink-0" />
              <span className="text-foreground">{formData.phoneNumber}</span>
            </div>
          )}
          {unit && !formData.isExternal && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 size={14} className="shrink-0" />
              <span className="text-foreground">{unit.name}</span>
            </div>
          )}
          {formData.isExternal && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe size={14} className="shrink-0" />
              <span className="text-foreground italic">Chuyên gia ngoài</span>
            </div>
          )}
          {degree && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap size={14} className="shrink-0" />
              <span className="text-foreground">{degree.label}</span>
            </div>
          )}
        </div>

        {/* Role badges */}
        {formData.roles?.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Vai trò</p>
            <div className="flex flex-wrap gap-1">
              {formData.roles.map((role) => {
                const cfg = ROLE_BADGE[role] || { label: role, color: "bg-gray-100 text-gray-600" };
                return (
                  <span
                    key={role}
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700">Hoạt động</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Form
// ────────────────────────────────────────────────────────────────────────
export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Fetch user data for edit mode
  const { data: existingUser, isLoading } = useUser(id);

  // Mutations
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    unitId: "",
    academicDegree: "",
    roles: [],
    temporaryPassword: "",
    isExternal: false,
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form in edit mode
  useEffect(() => {
    if (existingUser && isEditMode) {
      setFormData({
        fullName: existingUser.fullName || "",
        email: existingUser.email || "",
        phoneNumber: existingUser.phoneNumber || "",
        unitId: existingUser.unitId ? String(existingUser.unitId) : "",
        academicDegree: existingUser.academicDegree != null ? String(existingUser.academicDegree) : "",
        roles: existingUser.roles || [],
        temporaryPassword: "",
        isExternal: existingUser.isExternal || false,
      });
    }
  }, [existingUser, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (!formData.isExternal && !formData.unitId) {
      newErrors.unitId = "Vui lòng chọn đơn vị.";
    }

    if (formData.roles.length === 0) {
      newErrors.roles = "Vui lòng chọn ít nhất một vai trò.";
    }

    if (!isEditMode && !formData.isExternal && !formData.temporaryPassword) {
      newErrors.temporaryPassword = "Vui lòng nhập mật khẩu tạm thời.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      unitId: formData.isExternal ? null : Number(formData.unitId),
      academicDegree: formData.academicDegree ? Number(formData.academicDegree) : null,
      roles: formData.roles,
      isExternal: formData.isExternal,
      ...((!isEditMode && !formData.isExternal) && { temporaryPassword: formData.temporaryPassword }),
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate("/users", {
        state: { message: isEditMode ? "Cập nhật người dùng thành công." : "Tạo người dùng mới thành công." },
      });
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoading) {
    return <LoadingState message="Đang tải thông tin người dùng…" />;
  }

  // Email help text logic
  const emailHelpText = formData.isExternal
    ? "Email của chuyên gia ngoài, không giới hạn miền."
    : "Khuyến nghị sử dụng email @fe.edu.vn hoặc @fpt.edu.vn (nội bộ ĐH FPT).";

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground shrink-0"
          onClick={() => navigate("/users")}
          aria-label="Quay lại danh sách"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEditMode
              ? `Đang chỉnh sửa: ${existingUser?.fullName || ""}`
              : "Điền thông tin để tạo tài khoản mới trên hệ thống FURPMS."}
          </p>
        </div>
      </div>

      {/* 2-column layout */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User size={16} className="text-primary" /> Thông tin cơ bản
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Họ và tên"
                    required
                    placeholder="Nguyễn Văn An"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    error={errors.fullName}
                  />
                  <FormField
                    label="Email"
                    type="email"
                    required
                    placeholder="an.nguyen@fe.edu.vn"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    error={errors.email}
                    helpText={emailHelpText}
                    disabled={isEditMode}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Số điện thoại"
                    type="tel"
                    placeholder="0901234567"
                    value={formData.phoneNumber}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                  />
                  <SelectField
                    label="Học vị"
                    options={ACADEMIC_DEGREES.map((d) => ({ value: String(d.value), label: d.label }))}
                    value={formData.academicDegree}
                    onChange={(e) => updateField("academicDegree", e.target.value)}
                    placeholder="Chọn học vị…"
                  />
                </div>
              </CardContent>
            </Card>

            {/* External toggle + Unit */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Building2 size={16} className="text-primary" /> Đơn vị & Loại tài khoản
                </h3>

                {/* isExternal toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isExternal}
                      onChange={(e) => updateField("isExternal", e.target.checked)}
                    />
                    <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-primary transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Globe size={14} className="text-blue-500" /> Chuyên gia bên ngoài
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Bật nếu người dùng không thuộc ĐH FPT. Họ sẽ nhận mật khẩu qua invitation flow.
                    </p>
                  </div>
                </label>

                {/* Unit select (hidden if external) */}
                {!formData.isExternal && (
                  <SelectField
                    label="Đơn vị"
                    required
                    options={MOCK_UNITS.map((u) => ({ value: String(u.id), label: u.name }))}
                    value={formData.unitId}
                    onChange={(e) => updateField("unitId", e.target.value)}
                    error={errors.unitId}
                    placeholder="Chọn đơn vị…"
                  />
                )}

                {formData.isExternal && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-sm">
                    <p className="font-medium">Chuyên gia bên ngoài</p>
                    <p className="text-xs mt-1 text-blue-700">
                      Người dùng này không thuộc tổ chức nội bộ. Họ sẽ nhận thông tin đăng nhập thông qua luồng mời (Invitation Flow).
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Roles */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Shield size={16} className="text-primary" /> Vai trò
                </h3>
                {errors.roles && (
                  <p className="text-sm text-destructive font-medium" role="alert">
                    {errors.roles}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROLE_OPTIONS.map((role) => {
                    const isSelected = formData.roles.includes(role.value);
                    const cfg = ROLE_BADGE[role.value] || { color: "bg-gray-100 text-gray-600" };
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => toggleRole(role.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30 hover:bg-surface-variant/30"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
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
                          <p className="text-sm font-medium text-foreground">{role.label}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full mt-1 ${cfg.color}`}>
                            {role.value}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Password (only for create mode, non-external) */}
            {!isEditMode && !formData.isExternal && (
              <Card className="border-border shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Key size={16} className="text-primary" /> Mật khẩu tạm thời
                  </h3>
                  <FormField
                    label="Mật khẩu"
                    type="password"
                    required
                    placeholder="Nhập mật khẩu tạm thời…"
                    value={formData.temporaryPassword}
                    onChange={(e) => updateField("temporaryPassword", e.target.value)}
                    error={errors.temporaryPassword}
                    helpText="Người dùng sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu."
                  />
                </CardContent>
              </Card>
            )}

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
                {isEditMode ? "Lưu thay đổi" : "Tạo người dùng"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/users")}
                disabled={isSaving}
              >
                Hủy
              </Button>
            </div>
          </div>

          {/* ── Right: Preview ── */}
          <div>
            <UserPreviewCard formData={formData} />
          </div>
        </div>
      </form>
    </div>
  );
}
