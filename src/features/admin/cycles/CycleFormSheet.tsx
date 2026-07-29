import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCycleMutation, useUpdateCycleMutation } from "@/hooks/useCycles";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { cycleSchema, type CycleFormValues } from "@/features/admin/cycles/cycle.schema";
import type { Cycle } from "@/types/cycle";

interface CycleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: Cycle | null;
}

export function CycleFormSheet({ open, onOpenChange, cycle }: CycleFormSheetProps) {
  const isEdit = Boolean(cycle);
  const { data: researchTypes } = useResearchTypesQuery();
  const createMutation = useCreateCycleMutation();
  const updateMutation = useUpdateCycleMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      name: "",
      academicYear: "",
      researchTypeId: 0,
      submissionStartDate: "",
      submissionDeadline: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        cycle
          ? {
              name: cycle.name,
              academicYear: cycle.academicYear,
              researchTypeId: cycle.researchTypeId,
              submissionStartDate: dayjs(cycle.submissionStartDate).format("YYYY-MM-DD"),
              submissionDeadline: dayjs(cycle.submissionDeadline).format("YYYY-MM-DD"),
              description: cycle.description ?? "",
            }
          : {
              name: "",
              academicYear: "",
              researchTypeId: 0,
              submissionStartDate: "",
              submissionDeadline: "",
              description: "",
            }
      );
    }
  }, [open, cycle, reset]);

  const onSubmit = (values: CycleFormValues) => {
    const payload = { ...values, description: values.description || undefined };
    if (isEdit && cycle) {
      updateMutation.mutate({ id: cycle.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Research Cycle" : "Create Research Cycle"}
      description="Configure the submission window for this cycle."
      formId="cycle-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Create"}
    >
      <FormField label="Name" htmlFor="cycle-name" required error={errors.name?.message}>
        <Input id="cycle-name" placeholder="e.g. Spring 2026 Research Cycle" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>

      <FormField label="Academic year" htmlFor="cycle-year" required error={errors.academicYear?.message}>
        <Input id="cycle-year" placeholder="2025-2026" aria-invalid={Boolean(errors.academicYear)} {...register("academicYear")} />
      </FormField>

      <FormField label="Research type" required error={errors.researchTypeId?.message}>
        <Controller
          control={control}
          name="researchTypeId"
          render={({ field }) => (
            <Select value={field.value ? field.value.toString() : undefined} onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.researchTypeId)}>
                <SelectValue placeholder="Select research type" />
              </SelectTrigger>
              <SelectContent>
                {researchTypes?.map((rt) => (
                  <SelectItem key={rt.id} value={rt.id.toString()}>
                    {rt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-3">
        <FormField label="Submission start" htmlFor="cycle-start" required error={errors.submissionStartDate?.message}>
          <Input
            id="cycle-start"
            type="date"
            aria-invalid={Boolean(errors.submissionStartDate)}
            {...register("submissionStartDate")}
          />
        </FormField>
        <FormField label="Submission deadline" htmlFor="cycle-deadline" required error={errors.submissionDeadline?.message}>
          <Input
            id="cycle-deadline"
            type="date"
            aria-invalid={Boolean(errors.submissionDeadline)}
            {...register("submissionDeadline")}
          />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="cycle-description" helperText="Optional context shown to PIs and reviewers.">
        <Textarea id="cycle-description" rows={4} placeholder="Add notes about this cycle's focus or requirements..." {...register("description")} />
      </FormField>
    </FormSheet>
  );
}
