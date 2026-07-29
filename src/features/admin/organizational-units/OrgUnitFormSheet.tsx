import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCreateOrganizationalUnitMutation,
  useOrganizationalUnitsQuery,
  useUpdateOrganizationalUnitMutation,
} from "@/hooks/useOrganizationalUnits";
import { useUsersQuery } from "@/hooks/useUsers";
import { orgUnitSchema, type OrgUnitFormValues } from "@/features/admin/organizational-units/org-unit.schema";
import type { OrganizationalUnit } from "@/types/organizational-unit";

const NONE_VALUE = "none";

interface OrgUnitFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgUnit: OrganizationalUnit | null;
}

export function OrgUnitFormSheet({ open, onOpenChange, orgUnit }: OrgUnitFormSheetProps) {
  const isEdit = Boolean(orgUnit);
  const { data: units } = useOrganizationalUnitsQuery();
  const { data: users } = useUsersQuery();
  const createMutation = useCreateOrganizationalUnitMutation();
  const updateMutation = useUpdateOrganizationalUnitMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<OrgUnitFormValues>({
    resolver: zodResolver(orgUnitSchema),
    defaultValues: { code: "", name: "", unitType: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        orgUnit
          ? {
              code: orgUnit.code,
              name: orgUnit.name,
              unitType: orgUnit.unitType,
              parentId: orgUnit.parentId ?? undefined,
              headUserId: orgUnit.headUserId ?? undefined,
              sortOrder: orgUnit.sortOrder ?? undefined,
            }
          : { code: "", name: "", unitType: "" }
      );
    }
  }, [open, orgUnit, reset]);

  const onSubmit = (values: OrgUnitFormValues) => {
    if (isEdit && orgUnit) {
      updateMutation.mutate({ id: orgUnit.id, payload: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  const availableParents = units?.filter((u) => u.id !== orgUnit?.id) ?? [];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Organizational Unit" : "Create Organizational Unit"}
      description="Faculties, departments, and offices within the university."
      formId="org-unit-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Create"}
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Code" htmlFor="ou-code" required error={errors.code?.message}>
          <Input id="ou-code" aria-invalid={Boolean(errors.code)} {...register("code")} />
        </FormField>

        <FormField label="Unit type" htmlFor="ou-type" required error={errors.unitType?.message}>
          <Input
            id="ou-type"
            placeholder="Faculty, Department..."
            aria-invalid={Boolean(errors.unitType)}
            {...register("unitType")}
          />
        </FormField>
      </div>

      <FormField label="Name" htmlFor="ou-name" required error={errors.name?.message}>
        <Input id="ou-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Parent unit">
          <Controller
            control={control}
            name="parentId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : NONE_VALUE}
                onValueChange={(value) => field.onChange(value === NONE_VALUE ? undefined : Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>No parent</SelectItem>
                  {availableParents.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="Head of unit">
          <Controller
            control={control}
            name="headUserId"
            render={({ field }) => (
              <Select value={field.value ?? NONE_VALUE} onValueChange={(value) => field.onChange(value === NONE_VALUE ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Unassigned</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField label="Sort order" htmlFor="ou-sort" helperText="Controls display order among sibling units.">
        <Input id="ou-sort" type="number" {...register("sortOrder", { valueAsNumber: true })} />
      </FormField>
    </FormSheet>
  );
}
