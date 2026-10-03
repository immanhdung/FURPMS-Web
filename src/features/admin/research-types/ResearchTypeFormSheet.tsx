import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ResearchKindBadge } from "@/components/shared/ResearchKindBadge";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { useUpdateResearchTypeMutation } from "@/hooks/useResearchTypes";
import { researchTypeSchema, type ResearchTypeFormValues } from "@/features/admin/research-types/research-type.schema";
import type { ResearchType } from "@/types/research-type";

interface ResearchTypeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  researchType: ResearchType | null;
}

export function ResearchTypeFormSheet({ open, onOpenChange, researchType }: ResearchTypeFormSheetProps) {
  const { t, i18n } = useTranslation();
  // 03/10: chỉ có 2 loại cố định ⇒ form chỉ để SỬA tên và trần kinh phí (Điều 14.3: Hiệu trưởng nâng trần).
  const updateMutation = useUpdateResearchTypeMutation();
  const isSubmitting = updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ResearchTypeFormValues>({
    resolver: zodResolver(researchTypeSchema),
    defaultValues: { code: "", name: "", maxBudgetCap: 0, requireOrderingUnit: false },
  });

  useEffect(() => {
    if (open) {
      reset(
        researchType
          ? {
              code: researchType.code,
              name: researchType.name,
              maxBudgetCap: researchType.maxBudgetCap,
              requireOrderingUnit: researchType.requireOrderingUnit,
            }
          : { code: "", name: "", maxBudgetCap: 0, requireOrderingUnit: false },
      );
    }
  }, [open, researchType, reset]);

  const onSubmit = (values: ResearchTypeFormValues) => {
    if (!researchType) return;
    updateMutation.mutate(
      { id: researchType.id, payload: { name: values.name, maxBudgetCap: values.maxBudgetCap } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("researchTypes.editTitle")}
      description={t("researchTypes.formDesc")}
      formId="research-type-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={t("common.saveChanges")}
    >
      <div>
        <label htmlFor="rt-code" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("researchTypes.code")}
        </label>
        <div className="flex items-center gap-2">
          <Input id="rt-code" disabled className="max-w-40" {...register("code")} />
          {researchType && <ResearchKindBadge isApplied={researchType.kind === "APPLIED"} />}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{t("researchTypes.codeFixedHint")}</p>
      </div>

      <div>
        <label htmlFor="rt-name" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("researchTypes.name")}
        </label>
        <Input id="rt-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="rt-budget" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("researchTypes.maxBudgetCap")}
        </label>
        <Controller
          control={control}
          name="maxBudgetCap"
          render={({ field }) => {
            const locale = i18n.resolvedLanguage?.startsWith("en") ? "en-US" : "vi-VN";
            const formatted = field.value
              ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(field.value)
              : "";

            return (
              <div className="relative">
                <Input
                  {...field}
                  id="rt-budget"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatted}
                  className="pr-14 font-medium tracking-wide tabular-nums"
                  aria-invalid={Boolean(errors.maxBudgetCap)}
                  aria-describedby="rt-budget-hint"
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "");
                    field.onChange(digits ? Number(digits) : 0);
                  }}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground">
                  VND
                </span>
              </div>
            );
          }}
        />
        {errors.maxBudgetCap && <p className="mt-1 text-xs text-destructive">{errors.maxBudgetCap.message}</p>}
        <p id="rt-budget-hint" className="mt-1 text-xs text-muted-foreground">
          {t("researchTypes.maxBudgetCapHint")}
        </p>
      </div>

    </FormSheet>
  );
}
