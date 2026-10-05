import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateFinancialConfigMutation, useUpdateFinancialConfigMutation } from "@/hooks/useFinancialConfigs";
import {
  financialConfigSchema,
  type FinancialConfigFormValues,
} from "@/features/admin/financial-configs/financial-config.schema";
import type { FinancialConfig } from "@/types/financial-config";

interface FinancialConfigFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: FinancialConfig | null;
}

export function FinancialConfigFormSheet({ open, onOpenChange, config }: FinancialConfigFormSheetProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(config);
  const createMutation = useCreateFinancialConfigMutation();
  const updateMutation = useUpdateFinancialConfigMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FinancialConfigFormValues>({
    resolver: zodResolver(financialConfigSchema),
    defaultValues: { code: "", value: 0, description: "", effectiveDate: "", isActive: true },
  });

  useEffect(() => {
    if (open) {
      reset(
        config
          ? {
              code: config.code,
              value: config.value,
              description: config.description ?? "",
              effectiveDate: dayjs(config.effectiveDate).format("YYYY-MM-DD"),
              isActive: config.isActive,
            }
          : { code: "", value: 0, description: "", effectiveDate: "", isActive: true }
      );
    }
  }, [open, config, reset]);

  const onSubmit = (values: FinancialConfigFormValues) => {
    const payload = { ...values, description: values.description || undefined };
    if (isEdit && config) {
      updateMutation.mutate({ id: config.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t("financialConfigs.editTitle") : t("financialConfigs.createTitle")}
      description={t("financialConfigs.formDesc")}
      formId="financial-config-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? t("common.saveChanges") : t("common.create")}
    >
      <div>
        <label htmlFor="fc-code" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("common.code")}
        </label>
        <Input id="fc-code" aria-invalid={Boolean(errors.code)} {...register("code")} />
        {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
      </div>

      <div>
        <label htmlFor="fc-value" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("financialConfigs.value")}
        </label>
        <Input id="fc-value" type="number" step="any" aria-invalid={Boolean(errors.value)} {...register("value", { valueAsNumber: true })} />
        {errors.value && <p className="mt-1 text-xs text-destructive">{errors.value.message}</p>}
      </div>

      <div>
        <label htmlFor="fc-effective" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("financialConfigs.effectiveDate")}
        </label>
        <Input id="fc-effective" type="date" aria-invalid={Boolean(errors.effectiveDate)} {...register("effectiveDate")} />
        {errors.effectiveDate && <p className="mt-1 text-xs text-destructive">{errors.effectiveDate.message}</p>}
      </div>

      <div>
        <label htmlFor="fc-description" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("common.description")}
        </label>
        <Textarea id="fc-description" rows={3} {...register("description")} />
      </div>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
            {t("common.active")}
          </label>
        )}
      />
    </FormSheet>
  );
}
