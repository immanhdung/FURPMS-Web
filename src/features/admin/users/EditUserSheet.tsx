import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
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
      <div>
        <label htmlFor="edit-fullName" className="mb-1.5 block text-sm font-medium text-foreground">
          Full name
        </label>
        <Input id="edit-fullName" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
        {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="edit-phoneNumber" className="mb-1.5 block text-sm font-medium text-foreground">
          Phone number
        </label>
        <Input id="edit-phoneNumber" {...register("phoneNumber")} />
      </div>

      <div>
        <label htmlFor="edit-department" className="mb-1.5 block text-sm font-medium text-foreground">
          Department
        </label>
        <Input id="edit-department" {...register("department")} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Academic degree</label>
        <Controller
          control={control}
          name="academicDegree"
          render={({ field }) => (
            <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger>
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
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Roles</label>
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
                  {role}
                </label>
              ))}
            </div>
          )}
        />
        {errors.roles && <p className="mt-1 text-xs text-destructive">{errors.roles.message}</p>}
      </div>
    </FormSheet>
  );
}
