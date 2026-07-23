import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod/v4";
import { FormSheet } from "@/components/shared/FormSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useCreateChangeRequestMutation } from "@/hooks/useChangeRequests";
import type { ChangeRequestType } from "@/types/change-request";

const schema = z.object({
  type: z.enum(["1", "2", "3", "4", "5"]),
  description: z.string().min(10, "Description must be at least 10 characters."),
  newValue: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateChangeRequestSheetProps {
  proposalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_OPTIONS = [
  { value: "1", label: "Gia hạn thời gian (Extend Time)" },
  { value: "2", label: "Thay đổi nội dung (Content Change)" },
  { value: "3", label: "Thay đổi nhân sự (Personnel Change)" },
  { value: "4", label: "Thay đổi kinh phí (Budget Change)" },
  { value: "5", label: "Tạm dừng đề tài (Suspend)" },
] as const;

const SHOWS_NEW_VALUE: Record<string, string> = {
  "1": "Ngày kết thúc mới (yyyy-MM-dd)",
  "4": "Kinh phí mới (VND)",
};

export function CreateChangeRequestSheet({
  proposalId,
  open,
  onOpenChange,
}: CreateChangeRequestSheetProps) {
  const { t } = useTranslation();
  const mutation = useCreateChangeRequestMutation(proposalId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "1", description: "", newValue: "" },
  });

  const selectedType = watch("type");

  const onSubmit = (values: FormValues) => {
    mutation.mutate(
      {
        type: Number(values.type) as ChangeRequestType,
        description: values.description,
        newValue: values.newValue || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("changeRequest.createTitle")}
      description={t("changeRequest.createDesc")}
      formId="create-change-request-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={mutation.isPending}
      submitLabel={t("changeRequest.submitBtn")}
    >
      {/* Type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {t("changeRequest.type")}
        </label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("changeRequest.selectType")} />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
      </div>

      {/* New Value — only shown for types that need it */}
      {SHOWS_NEW_VALUE[selectedType] && (
        <div>
          <label htmlFor="newValue" className="mb-1.5 block text-sm font-medium text-foreground">
            {SHOWS_NEW_VALUE[selectedType]}
          </label>
          <Input id="newValue" {...register("newValue")} />
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="cr-description" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("changeRequest.description")}
        </label>
        <Textarea
          id="cr-description"
          rows={5}
          placeholder={t("changeRequest.descriptionPlaceholder")}
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>
    </FormSheet>
  );
}
