import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTrackMutation, useUpdateTrackMutation } from "@/hooks/useTracks";
import { useUsersQuery } from "@/hooks/useUsers";
import { useCyclesQuery } from "@/hooks/useCycles";
import { trackSchema, type TrackFormValues } from "@/features/staff/tracks/track.schema";
import type { Track } from "@/types/track";

const NONE_VALUE = "none";

interface TrackFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: Track | null;
  /** When set (e.g. opened from a cycle row's "Add research field" action), the cycle is fixed and not asked for. */
  fixedCycleId?: number;
}

export function TrackFormSheet({ open, onOpenChange, track, fixedCycleId }: TrackFormSheetProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(track);
  const { data: users } = useUsersQuery();
  const { data: cycles } = useCyclesQuery();
  const createMutation = useCreateTrackMutation();
  const updateMutation = useUpdateTrackMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: { name: "", description: "", ownerId: undefined, cycleId: undefined },
  });

  useEffect(() => {
    if (open) {
      reset(
        track
          ? { name: track.name, description: track.description ?? "", ownerId: track.ownerId ?? undefined }
          : { name: "", description: "", ownerId: undefined, cycleId: fixedCycleId }
      );
    }
  }, [open, track, fixedCycleId, reset]);

  const onSubmit = (values: TrackFormValues) => {
    if (isEdit && track) {
      updateMutation.mutate(
        { id: track.id, payload: { name: values.name, description: values.description } },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      const cycleId = fixedCycleId ?? values.cycleId;
      if (!cycleId) {
        setError("cycleId", { message: t("staff.selectCycle") });
        return;
      }
      createMutation.mutate(
        { cycleId, payload: { name: values.name, description: values.description, ownerId: values.ownerId } },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t("staff.editField") : t("staff.createField")}
      description={t("staff.fieldFormDesc")}
      formId="track-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? t("common.saveChanges") : t("common.create")}
    >
      {!isEdit && !fixedCycleId && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("staff.fieldCycle")}</label>
          <Controller
            control={control}
            name="cycleId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : undefined}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger aria-invalid={Boolean(errors.cycleId)}>
                  <SelectValue placeholder={t("staff.selectCycle")} />
                </SelectTrigger>
                <SelectContent>
                  {cycles?.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id.toString()}>
                      {cycle.name} ({cycle.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.cycleId && <p className="mt-1 text-xs text-destructive">{errors.cycleId.message}</p>}
        </div>
      )}

      <div>
        <label htmlFor="track-name" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("common.name")}
        </label>
        <Input id="track-name" placeholder={t("staff.fieldNamePlaceholder")} aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="track-description" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("common.description")}
        </label>
        <Textarea id="track-description" rows={3} {...register("description")} />
      </div>

      {!isEdit && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("staff.owner")}</label>
          <Controller
            control={control}
            name="ownerId"
            render={({ field }) => (
              <Select value={field.value ?? NONE_VALUE} onValueChange={(value) => field.onChange(value === NONE_VALUE ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("staff.unassigned")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>{t("staff.unassigned")}</SelectItem>
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
      )}
    </FormSheet>
  );
}
