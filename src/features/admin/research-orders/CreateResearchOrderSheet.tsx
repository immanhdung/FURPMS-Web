import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { FormField } from "@/components/shared/FormField";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateResearchOrderMutation } from "@/hooks/useResearchOrders";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useOrganizationalUnitsQuery } from "@/hooks/useOrganizationalUnits";
import {
  researchOrderSchema,
  type ResearchOrderFormValues,
} from "@/features/admin/research-orders/research-order.schema";

interface CreateResearchOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateResearchOrderSheet({ open, onOpenChange }: CreateResearchOrderSheetProps) {
  const { data: cycles } = useCyclesQuery();
  const { data: units } = useOrganizationalUnitsQuery();
  const createMutation = useCreateResearchOrderMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ResearchOrderFormValues>({
    resolver: zodResolver(researchOrderSchema),
    defaultValues: { cycleId: 0, orderingUnitId: 0, researchArea: "", problemDescription: "", expectedProducts: "" },
  });

  const onSubmit = (values: ResearchOrderFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create Research Order"
      description="Submit an applied research topic order from an external unit."
      formId="research-order-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createMutation.isPending}
      submitLabel="Create order"
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Research cycle" required error={errors.cycleId?.message}>
          <Controller
            control={control}
            name="cycleId"
            render={({ field }) => (
              <Select value={field.value ? field.value.toString() : undefined} onValueChange={(value) => field.onChange(Number(value))}>
                <SelectTrigger aria-invalid={Boolean(errors.cycleId)} className="w-full">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {cycles?.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id.toString()}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="Ordering unit" required error={errors.orderingUnitId?.message}>
          <Controller
            control={control}
            name="orderingUnitId"
            render={({ field }) => (
              <Select value={field.value ? field.value.toString() : undefined} onValueChange={(value) => field.onChange(Number(value))}>
                <SelectTrigger aria-invalid={Boolean(errors.orderingUnitId)} className="w-full">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField label="Research area" htmlFor="ro-area" required error={errors.researchArea?.message}>
        <Input id="ro-area" aria-invalid={Boolean(errors.researchArea)} {...register("researchArea")} />
      </FormField>

      <FormField label="Problem description" htmlFor="ro-problem" required error={errors.problemDescription?.message}>
        <Textarea id="ro-problem" rows={4} aria-invalid={Boolean(errors.problemDescription)} {...register("problemDescription")} />
      </FormField>

      <FormField label="Expected products" htmlFor="ro-products" required error={errors.expectedProducts?.message}>
        <Textarea id="ro-products" rows={3} aria-invalid={Boolean(errors.expectedProducts)} {...register("expectedProducts")} />
      </FormField>
    </FormSheet>
  );
}
