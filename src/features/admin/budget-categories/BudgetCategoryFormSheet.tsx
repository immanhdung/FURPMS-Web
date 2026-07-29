import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateBudgetCategoryMutation, useUpdateBudgetCategoryMutation } from "@/hooks/useBudgetCategories";
import {
  budgetCategorySchema,
  type BudgetCategoryFormValues,
} from "@/features/admin/budget-categories/budget-category.schema";
import type { BudgetCategory } from "@/types/budget-category";

interface BudgetCategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: BudgetCategory | null;
}

export function BudgetCategoryFormSheet({ open, onOpenChange, category }: BudgetCategoryFormSheetProps) {
  const isEdit = Boolean(category);
  const createMutation = useCreateBudgetCategoryMutation();
  const updateMutation = useUpdateBudgetCategoryMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BudgetCategoryFormValues>({
    resolver: zodResolver(budgetCategorySchema),
    defaultValues: { code: "", name: "", sequence: 0, isActive: true },
  });

  useEffect(() => {
    if (open) {
      reset(category ?? { code: "", name: "", sequence: 0, isActive: true });
    }
  }, [open, category, reset]);

  const onSubmit = (values: BudgetCategoryFormValues) => {
    if (isEdit && category) {
      updateMutation.mutate({ id: category.id, payload: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Budget Category" : "Create Budget Category"}
      description="Expense categories used in proposal budgets."
      formId="budget-category-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Create"}
    >
      <FormField label="Code" htmlFor="bc-code" required error={errors.code?.message}>
        <Input id="bc-code" aria-invalid={Boolean(errors.code)} {...register("code")} />
      </FormField>

      <FormField label="Name" htmlFor="bc-name" required error={errors.name?.message}>
        <Input id="bc-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>

      <FormField label="Sequence" htmlFor="bc-sequence" required error={errors.sequence?.message}>
        <Input
          id="bc-sequence"
          type="number"
          aria-invalid={Boolean(errors.sequence)}
          {...register("sequence", { valueAsNumber: true })}
        />
      </FormField>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label
            htmlFor="bc-is-active"
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm text-foreground"
          >
            <span className="font-medium">Active</span>
            <Checkbox
              id="bc-is-active"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
            />
          </label>
        )}
      />
    </FormSheet>
  );
}
