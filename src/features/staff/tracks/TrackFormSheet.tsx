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
import { trackSchema, type TrackFormValues } from "@/features/staff/tracks/track.schema";
import type { Track } from "@/types/track";

const NONE_VALUE = "none";

interface TrackFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: Track | null;
}

/**
 * Tạo/sửa lĩnh vực GLOBAL (dữ liệu dùng chung, không thuộc đợt nào). Việc gắn lĩnh vực vào từng
 * đợt làm riêng ở màn Đợt (đợt tự chọn lĩnh vực nó mở).
 */
export function TrackFormSheet({ open, onOpenChange, track }: TrackFormSheetProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(track);
  const { data: users } = useUsersQuery();
  const createMutation = useCreateTrackMutation();
  const updateMutation = useUpdateTrackMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: { name: "", description: "", ownerId: undefined },
  });

  useEffect(() => {
    if (open) {
      reset(
        track
          ? { name: track.name, description: track.description ?? "", ownerId: track.ownerId ?? undefined }
          : { name: "", description: "", ownerId: undefined }
      );
    }
  }, [open, track, reset]);

  const onSubmit = (values: TrackFormValues) => {
    const payload = { name: values.name, description: values.description, ownerId: values.ownerId ?? null };
    if (isEdit && track) {
      updateMutation.mutate({ id: track.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(
        { name: values.name, description: values.description, ownerId: values.ownerId },
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
    </FormSheet>
  );
}
