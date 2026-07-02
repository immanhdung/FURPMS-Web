import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
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
      <div>
        <label htmlFor="bc-code" className="mb-1.5 block text-sm font-medium text-foreground">
          Code
        </label>
        <Input id="bc-code" aria-invalid={Boolean(errors.code)} {...register("code")} />
        {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
      </div>

      <div>
        <label htmlFor="bc-name" className="mb-1.5 block text-sm font-medium text-foreground">
          Name
        </label>
        <Input id="bc-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="bc-sequence" className="mb-1.5 block text-sm font-medium text-foreground">
          Sequence
        </label>
        <Input id="bc-sequence" type="number" aria-invalid={Boolean(errors.sequence)} {...register("sequence", { valueAsNumber: true })} />
        {errors.sequence && <p className="mt-1 text-xs text-destructive">{errors.sequence.message}</p>}
      </div>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
            Active
          </label>
        )}
      />
    </FormSheet>
  );
}
