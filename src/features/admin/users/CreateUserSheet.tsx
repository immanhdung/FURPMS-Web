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
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-foreground">
          Full name
        </label>
        <Input id="fullName" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
        {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="mb-1.5 block text-sm font-medium text-foreground">
          Phone number
        </label>
        <Input id="phoneNumber" {...register("phoneNumber")} />
      </div>

      <div>
        <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-foreground">
          Department
        </label>
        <Input id="department" {...register("department")} />
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

      <div>
        <label htmlFor="temporaryPassword" className="mb-1.5 block text-sm font-medium text-foreground">
          Temporary password
        </label>
        <Input
          id="temporaryPassword"
          type="password"
          aria-invalid={Boolean(errors.temporaryPassword)}
          {...register("temporaryPassword")}
        />
        {errors.temporaryPassword && (
          <p className="mt-1 text-xs text-destructive">{errors.temporaryPassword.message}</p>
        )}
      </div>
    </FormSheet>
  );
}
