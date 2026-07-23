import { useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerateGoogleMeetLink, useScheduleMeetingMutation } from "@/hooks/useMeetings";
import { MEETING_MODES, IN_PERSON } from "@/types/meeting";

const schema = z
  .object({
    title: z.string().min(1, "Title is required"),
    platform: z.string().min(1, "Select a platform"),
    meetingLink: z.string().optional(),
    location: z.string().optional(),
    scheduledAt: z.string().min(1, "Date and time are required"),
    durationMinutes: z.number().min(15, "Must be at least 15 minutes"),
    agenda: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.platform === IN_PERSON && !v.location?.trim())
      ctx.addIssue({ code: "custom", path: ["location"], message: "Location is required for in-person meetings" });
  });

type FormValues = z.infer<typeof schema>;

interface ScheduleMeetingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  councilId: string;
}

export function ScheduleMeetingSheet({ open, onOpenChange, councilId }: ScheduleMeetingSheetProps) {
  const { t } = useTranslation();
  const scheduleMutation = useScheduleMeetingMutation(councilId);
  const generateLinkMutation = useGenerateGoogleMeetLink();
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", platform: MEETING_MODES[0].value, meetingLink: "", location: "", scheduledAt: "", durationMinutes: 60, agenda: "" },
  });

  const platform = watch("platform");
  const isOffline = platform === IN_PERSON;

  const onSubmit = (values: FormValues) => {
    scheduleMutation.mutate(
      {
        ...values,
        agenda: values.agenda || undefined,
        meetingLink: isOffline ? undefined : values.meetingLink || undefined,
        location: isOffline ? values.location || undefined : undefined,
      },
      {
        onSuccess: () => {
          reset();
          setGeneratedLink(null);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("reviewBoard.scheduleMeeting")}
      description={t("reviewBoard.scheduleMeetingHint")}
      formId="schedule-meeting-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={scheduleMutation.isPending}
      submitLabel={t("reviewBoard.scheduleMeetingBtn")}
    >
      <div>
        <label htmlFor="meeting-title" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("reviewBoard.meetingTitle")}
        </label>
        <Input id="meeting-title" aria-invalid={Boolean(errors.title)} {...register("title")} />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.platform")}</label>
        <Controller
          control={control}
          name="platform"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {t(m.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {isOffline ? (
        <div>
          <label htmlFor="meeting-location" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("reviewBoard.locationLabel")} <span className="text-destructive">*</span>
          </label>
          <Input
            id="meeting-location"
            placeholder={t("reviewBoard.locationPlaceholder")}
            aria-invalid={Boolean(errors.location)}
            {...register("location")}
          />
          {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location.message}</p>}
        </div>
      ) : (
        <div>
          <label htmlFor="meeting-link" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("reviewBoard.meetingLinkLabel")}
          </label>
          <div className="flex gap-2">
            <Input id="meeting-link" placeholder="https://..." {...register("meetingLink")} />
            {platform === "GOOGLE_MEET" && (
              <Button
                type="button"
                variant="outline"
                disabled={generateLinkMutation.isPending}
                onClick={() =>
                  generateLinkMutation.mutate(undefined, {
                    onSuccess: (data) => {
                      setValue("meetingLink", data.meetingLink);
                      setGeneratedLink(data.meetingLink);
                    },
                  })
                }
              >
                {generateLinkMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {t("reviewBoard.generate")}
              </Button>
            )}
          </div>
          {generatedLink && <p className="mt-1 text-xs text-muted-foreground">{t("reviewBoard.generatedLink", { link: generatedLink })}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="meeting-scheduled" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("reviewBoard.dateTime")}
          </label>
          <Input id="meeting-scheduled" type="datetime-local" aria-invalid={Boolean(errors.scheduledAt)} {...register("scheduledAt")} />
          {errors.scheduledAt && <p className="mt-1 text-xs text-destructive">{errors.scheduledAt.message}</p>}
        </div>
        <div>
          <label htmlFor="meeting-duration" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("reviewBoard.durationLabel")}
          </label>
          <Input id="meeting-duration" type="number" aria-invalid={Boolean(errors.durationMinutes)} {...register("durationMinutes", { valueAsNumber: true })} />
          {errors.durationMinutes && <p className="mt-1 text-xs text-destructive">{errors.durationMinutes.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="meeting-agenda" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("reviewBoard.agenda")}
        </label>
        <Textarea id="meeting-agenda" rows={3} {...register("agenda")} />
      </div>
    </FormSheet>
  );
}
