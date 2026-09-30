import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUserMutation } from "@/hooks/useUsers";
import { createUserSchema, type CreateUserFormValues } from "@/features/admin/users/user.schema";
import { ACADEMIC_DEGREES } from "@/types/user";
import { ALL_ROLES, ROLE_ID_MAP } from "@/constants/roles";
import { UnitSelect } from "@/features/admin/users/UnitSelect";

interface CreateUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserSheet({ open, onOpenChange }: CreateUserSheetProps) {
  const { t } = useTranslation();
  const createUserMutation = useCreateUserMutation();
  // Mật khẩu tạm do admin tự đặt rồi báo lại cho người dùng — phải xem được mình vừa gõ gì,
  // gõ nhầm một ký tự là người kia không đăng nhập nổi.
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "", fullName: "", phoneNumber: "", department: "", roles: [], temporaryPassword: "" },
  });

  const onSubmit = (values: CreateUserFormValues) => {
    createUserMutation.mutate(
      {
        email: values.email,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        department: values.department || undefined,
        academicDegree: values.academicDegree,
        roles: values.roles.map((role) => ROLE_ID_MAP[role as keyof typeof ROLE_ID_MAP]),
        temporaryPassword: values.temporaryPassword,
      },
      {
        onSuccess: () => {
          reset();
          setShowPassword(false);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("users.createTitle")}
      description={t("users.createDesc")}
      formId="create-user-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createUserMutation.isPending}
      submitLabel={t("users.createBtn")}
    >
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("users.email")}
        </label>
        <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("users.fullName")}
        </label>
        <Input id="fullName" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
        {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("users.phoneNumber")}
        </label>
        <Input id="phoneNumber" {...register("phoneNumber")} />
      </div>

      <div>
        <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("users.department")}
        </label>
        <Controller
          control={control}
          name="department"
          render={({ field }) => <UnitSelect id="department" value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("users.academicDegree")}</label>
        <Controller
          control={control}
          name="academicDegree"
          render={({ field }) => (
            <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder={t("users.selectDegree")} />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_DEGREES.map((degree) => (
                  <SelectItem key={degree.value} value={degree.value.toString()}>
                    {degree.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("users.roles")}</label>
        <Controller
          control={control}
          name="roles"
          render={({ field }) => (
            <div className="space-y-2">
              {ALL_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={field.value?.includes(role)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...(field.value ?? []), role]
                        : (field.value ?? []).filter((r) => r !== role);
                      field.onChange(next);
                    }}
                  />
                  {/* Trước đây in thẳng mã vai (Admin/Staff/Faculty/ReviewCommittee) giữa form
                      tiếng Việt — bảng nhãn `roleName` vốn đã có sẵn mà không ai dùng. */}
                  {t(`roleName.${role}`, { defaultValue: role })}
                </label>
              ))}
            </div>
          )}
        />
        {errors.roles && <p className="mt-1 text-xs text-destructive">{errors.roles.message}</p>}
      </div>

      <div>
        <label htmlFor="temporaryPassword" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("users.temporaryPassword")}
        </label>
        <div className="relative">
          <Input
            id="temporaryPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="pr-9"
            aria-invalid={Boolean(errors.temporaryPassword)}
            {...register("temporaryPassword")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showPassword ? t("users.hidePassword") : t("users.showPassword")}
            title={showPassword ? t("users.hidePassword") : t("users.showPassword")}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.temporaryPassword && (
          <p className="mt-1 text-xs text-destructive">{errors.temporaryPassword.message}</p>
        )}
      </div>
    </FormSheet>
  );
}
