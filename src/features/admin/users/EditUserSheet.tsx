import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateUserMutation } from "@/hooks/useUsers";
import { editUserSchema, type EditUserFormValues } from "@/features/admin/users/user.schema";
import { ACADEMIC_DEGREES } from "@/types/user";
import type { AdminUser } from "@/types/user";
import { ALL_ROLES, ROLE_ID_MAP } from "@/constants/roles";

interface EditUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
}

export function EditUserSheet({ open, onOpenChange, user }: EditUserSheetProps) {
  const updateUserMutation = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { fullName: "", phoneNumber: "", department: "", roles: [] },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber ?? "",
        department: user.department ?? "",
        academicDegree: user.academicDegree ?? undefined,
        roles: user.roles,
      });
    }
  }, [user, reset]);

  const onSubmit = (values: EditUserFormValues) => {
    if (!user) return;
    updateUserMutation.mutate(
      {
        id: user.id,
        payload: {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber || undefined,
          department: values.department || undefined,
          academicDegree: values.academicDegree,
          roles: values.roles.map((role) => ROLE_ID_MAP[role as keyof typeof ROLE_ID_MAP]),
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User"
      description={user ? `Update details for ${user.fullName}` : undefined}
      formId="edit-user-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={updateUserMutation.isPending}
      submitLabel="Save changes"
    >
      <FormField label="Full name" htmlFor="edit-fullName" required error={errors.fullName?.message}>
        <Input id="edit-fullName" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Phone number" htmlFor="edit-phoneNumber">
          <Input id="edit-phoneNumber" {...register("phoneNumber")} />
        </FormField>

        <FormField label="Department" htmlFor="edit-department">
          <Input id="edit-department" {...register("department")} />
        </FormField>
      </div>

      <FormField label="Academic degree" htmlFor="edit-academicDegree">
        <Controller
          control={control}
          name="academicDegree"
          render={({ field }) => (
            <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger id="edit-academicDegree" className="w-full">
                <SelectValue placeholder="Select degree" />
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
      </FormField>

      <FormField label="Roles" required error={errors.roles?.message}>
        <Controller
          control={control}
          name="roles"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-1.5 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-2">
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
                  {role}
                </label>
              ))}
            </div>
          )}
        />
      </FormField>
    </FormSheet>
  );
}
