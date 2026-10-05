import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
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
  const { t } = useTranslation();
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
      title={t("researchOrders.createTitle")}
      description={t("researchOrders.formDesc")}
      formId="research-order-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createMutation.isPending}
      submitLabel={t("researchOrders.createBtn")}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("researchOrders.researchCycle")}</label>
        <Controller
          control={control}
          name="cycleId"
          render={({ field }) => (
            <Select value={field.value ? field.value.toString() : undefined} onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger aria-invalid={Boolean(errors.cycleId)}>
                <SelectValue placeholder={t("researchOrders.selectCycle")} />
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
        {errors.cycleId && <p className="mt-1 text-xs text-destructive">{errors.cycleId.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("researchOrders.orderingUnit")}</label>
        <Controller
          control={control}
          name="orderingUnitId"
          render={({ field }) => (
            <Select value={field.value ? field.value.toString() : undefined} onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger aria-invalid={Boolean(errors.orderingUnitId)}>
                <SelectValue placeholder={t("researchOrders.selectUnit")} />
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
        {errors.orderingUnitId && <p className="mt-1 text-xs text-destructive">{errors.orderingUnitId.message}</p>}
      </div>

      <div>
        <label htmlFor="ro-area" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("researchOrders.researchArea")}
        </label>
        <Input id="ro-area" aria-invalid={Boolean(errors.researchArea)} {...register("researchArea")} />
        {errors.researchArea && <p className="mt-1 text-xs text-destructive">{errors.researchArea.message}</p>}
      </div>

      <div>
        <label htmlFor="ro-problem" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("researchOrders.problemDescription")}
        </label>
        <Textarea id="ro-problem" rows={4} aria-invalid={Boolean(errors.problemDescription)} {...register("problemDescription")} />
        {errors.problemDescription && (
          <p className="mt-1 text-xs text-destructive">{errors.problemDescription.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="ro-products" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("researchOrders.expectedProducts")}
        </label>
        <Textarea id="ro-products" rows={3} aria-invalid={Boolean(errors.expectedProducts)} {...register("expectedProducts")} />
        {errors.expectedProducts && <p className="mt-1 text-xs text-destructive">{errors.expectedProducts.message}</p>}
      </div>
    </FormSheet>
  );
}
