import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUserMutation } from "@/hooks/useUsers";
import { createUserSchema, type CreateUserFormValues } from "@/features/admin/users/user.schema";
import { ACADEMIC_DEGREES } from "@/types/user";
import { ALL_ROLES, ROLE_ID_MAP } from "@/constants/roles";

interface CreateUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserSheet({ open, onOpenChange }: CreateUserSheetProps) {
  const createUserMutation = useCreateUserMutation();

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
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create User"
      description="Add a new user account to FURPMS."
      formId="create-user-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createUserMutation.isPending}
      submitLabel="Create user"
    >
      <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
        <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
      </FormField>

      <FormField label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
        <Input id="fullName" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Phone number" htmlFor="phoneNumber">
          <Input id="phoneNumber" {...register("phoneNumber")} />
        </FormField>

        <FormField label="Department" htmlFor="department">
          <Input id="department" {...register("department")} />
        </FormField>
      </div>

      <FormField label="Academic degree" htmlFor="academicDegree">
        <Controller
          control={control}
          name="academicDegree"
          render={({ field }) => (
            <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger id="academicDegree" className="w-full">
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

      <FormField
        label="Temporary password"
        htmlFor="temporaryPassword"
        required
        error={errors.temporaryPassword?.message}
        helperText="The user will be asked to change this on first login."
      >
        <Input
          id="temporaryPassword"
          type="password"
          aria-invalid={Boolean(errors.temporaryPassword)}
          {...register("temporaryPassword")}
        />
      </FormField>
    </FormSheet>
  );
}
