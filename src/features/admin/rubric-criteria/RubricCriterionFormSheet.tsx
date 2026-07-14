import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
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
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Round type</label>
        <Controller
          control={control}
          name="roundType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
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
        {errors.roundType && <p className="mt-1 text-xs text-destructive">{errors.roundType.message}</p>}
      </div>

      <div>
        <label htmlFor="rc-name" className="mb-1.5 block text-sm font-medium text-foreground">
          Name
        </label>
        <Input id="rc-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="rc-order" className="mb-1.5 block text-sm font-medium text-foreground">
            Order index
          </label>
          <Input id="rc-order" type="number" {...register("orderIndex", { valueAsNumber: true })} />
        </div>
        <div>
          <label htmlFor="rc-maxscore" className="mb-1.5 block text-sm font-medium text-foreground">
            Max score
          </label>
          <Input id="rc-maxscore" type="number" step="any" aria-invalid={Boolean(errors.maxScore)} {...register("maxScore", { valueAsNumber: true })} />
          {errors.maxScore && <p className="mt-1 text-xs text-destructive">{errors.maxScore.message}</p>}
        </div>
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
