import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCreateRubricCriterionMutation,
  useUpdateRubricCriterionMutation,
} from "@/hooks/useRubricCriteria";
import {
  rubricCriterionSchema,
  type RubricCriterionFormValues,
} from "@/features/admin/rubric-criteria/rubric-criterion.schema";
import {
  REVIEW_ROUND_TYPE,
  ROUND_TYPE_ID_MAP,
  ROUND_TYPE_LABELS,
  rubricRoundTypeToAppType,
  type ReviewRoundType,
} from "@/constants/statuses";
import type { RubricCriterion } from "@/types/rubric-criterion";

interface RubricCriterionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criterion: RubricCriterion | null;
}

export function RubricCriterionFormSheet({ open, onOpenChange, criterion }: RubricCriterionFormSheetProps) {
  const isEdit = Boolean(criterion);
  const createMutation = useCreateRubricCriterionMutation();
  const updateMutation = useUpdateRubricCriterionMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RubricCriterionFormValues>({
    resolver: zodResolver(rubricCriterionSchema),
    defaultValues: { roundType: REVIEW_ROUND_TYPE.REVIEW, orderIndex: 0, name: "", maxScore: 10, isActive: true },
  });

  useEffect(() => {
    if (open) {
      reset(
        criterion
          ? {
              roundType: rubricRoundTypeToAppType(criterion.roundType) ?? REVIEW_ROUND_TYPE.REVIEW,
              orderIndex: criterion.orderIndex,
              name: criterion.name,
              maxScore: criterion.maxScore,
              isActive: criterion.isActive,
            }
          : { roundType: REVIEW_ROUND_TYPE.REVIEW, orderIndex: 0, name: "", maxScore: 10, isActive: true }
      );
    }
  }, [open, criterion, reset]);

  const onSubmit = (values: RubricCriterionFormValues) => {
    const payload = {
      ...values,
      roundType: ROUND_TYPE_ID_MAP[values.roundType as ReviewRoundType],
    };
    if (isEdit && criterion) {
      updateMutation.mutate({ id: criterion.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Rubric Criterion" : "Create Rubric Criterion"}
      description="Scoring criteria used in review rounds."
      formId="rubric-criterion-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Create"}
    >
      <FormField label="Round type" error={errors.roundType?.message} required>
        <Controller
          control={control}
          name="roundType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={Boolean(errors.roundType)}>
                <SelectValue placeholder="Select round type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(REVIEW_ROUND_TYPE).map((type) => (
                  <SelectItem key={type} value={type}>
                    {ROUND_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField label="Name" htmlFor="rc-name" error={errors.name?.message} required>
        <Input id="rc-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Order index" htmlFor="rc-order" error={errors.orderIndex?.message}>
          <Input id="rc-order" type="number" aria-invalid={Boolean(errors.orderIndex)} {...register("orderIndex", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Max score" htmlFor="rc-maxscore" error={errors.maxScore?.message} required>
          <Input
            id="rc-maxscore"
            type="number"
            step="any"
            className="text-right tabular-nums"
            aria-invalid={Boolean(errors.maxScore)}
            {...register("maxScore", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground">
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
            Active
          </label>
        )}
      />
    </FormSheet>
  );
}
