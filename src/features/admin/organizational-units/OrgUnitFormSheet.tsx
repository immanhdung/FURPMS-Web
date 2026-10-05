import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
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
  const { t } = useTranslation();
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
      title={isEdit ? t("orgUnits.editTitle") : t("orgUnits.createTitle")}
      description={t("orgUnits.formDesc")}
      formId="org-unit-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? t("common.saveChanges") : t("common.create")}
    >
      <div>
        <label htmlFor="ou-code" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("common.code")}
        </label>
        <Input id="ou-code" aria-invalid={Boolean(errors.code)} {...register("code")} />
        {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
      </div>

      <div>
        <label htmlFor="ou-name" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("common.name")}
        </label>
        <Input id="ou-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="ou-type" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("orgUnits.unitType")}
        </label>
        <Input id="ou-type" placeholder={t("orgUnits.unitTypePlaceholder")} aria-invalid={Boolean(errors.unitType)} {...register("unitType")} />
        {errors.unitType && <p className="mt-1 text-xs text-destructive">{errors.unitType.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("orgUnits.parentUnit")}</label>
        <Controller
          control={control}
          name="parentId"
          render={({ field }) => (
            <Select
              value={field.value ? field.value.toString() : NONE_VALUE}
              onValueChange={(value) => field.onChange(value === NONE_VALUE ? undefined : Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("orgUnits.noParent")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>{t("orgUnits.noParent")}</SelectItem>
                {availableParents.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("orgUnits.headOfUnit")}</label>
        <Controller
          control={control}
          name="headUserId"
          render={({ field }) => (
            <Select value={field.value ?? NONE_VALUE} onValueChange={(value) => field.onChange(value === NONE_VALUE ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("orgUnits.unassigned")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>{t("orgUnits.unassigned")}</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <label htmlFor="ou-sort" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("orgUnits.sortOrder")}
        </label>
        <Input id="ou-sort" type="number" {...register("sortOrder", { valueAsNumber: true })} />
      </div>
    </FormSheet>
  );
}
