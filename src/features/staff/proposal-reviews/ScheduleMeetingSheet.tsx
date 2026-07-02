import { useState } from "react";
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
import { MEETING_PLATFORMS } from "@/types/meeting";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  platform: z.string().min(1, "Select a platform"),
  meetingLink: z.string().optional(),
  scheduledAt: z.string().min(1, "Date and time are required"),
  durationMinutes: z.number().min(15, "Must be at least 15 minutes"),
  agenda: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ScheduleMeetingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  councilId: string;
}

export function ScheduleMeetingSheet({ open, onOpenChange, councilId }: ScheduleMeetingSheetProps) {
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
    defaultValues: { title: "", platform: MEETING_PLATFORMS[0], meetingLink: "", scheduledAt: "", durationMinutes: 60, agenda: "" },
  });

  const platform = watch("platform");

  const onSubmit = (values: FormValues) => {
    scheduleMutation.mutate(
      { ...values, agenda: values.agenda || undefined, meetingLink: values.meetingLink || undefined },
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
      title="Schedule Meeting"
      description="Set up a council review meeting."
      formId="schedule-meeting-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={scheduleMutation.isPending}
      submitLabel="Schedule meeting"
    >
      <div>
        <label htmlFor="meeting-title" className="mb-1.5 block text-sm font-medium text-foreground">
          Title
        </label>
        <Input id="meeting-title" aria-invalid={Boolean(errors.title)} {...register("title")} />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Platform</label>
        <Controller
          control={control}
          name="platform"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <label htmlFor="meeting-link" className="mb-1.5 block text-sm font-medium text-foreground">
          Meeting link
        </label>
        <div className="flex gap-2">
          <Input id="meeting-link" placeholder="https://..." {...register("meetingLink")} />
          {platform === "Google Meet" && (
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
              Generate
            </Button>
          )}
        </div>
        {generatedLink && <p className="mt-1 text-xs text-muted-foreground">Generated: {generatedLink}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="meeting-scheduled" className="mb-1.5 block text-sm font-medium text-foreground">
            Date &amp; time
          </label>
          <Input id="meeting-scheduled" type="datetime-local" aria-invalid={Boolean(errors.scheduledAt)} {...register("scheduledAt")} />
          {errors.scheduledAt && <p className="mt-1 text-xs text-destructive">{errors.scheduledAt.message}</p>}
        </div>
        <div>
          <label htmlFor="meeting-duration" className="mb-1.5 block text-sm font-medium text-foreground">
            Duration (min)
          </label>
          <Input id="meeting-duration" type="number" aria-invalid={Boolean(errors.durationMinutes)} {...register("durationMinutes", { valueAsNumber: true })} />
          {errors.durationMinutes && <p className="mt-1 text-xs text-destructive">{errors.durationMinutes.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="meeting-agenda" className="mb-1.5 block text-sm font-medium text-foreground">
          Agenda
        </label>
        <Textarea id="meeting-agenda" rows={3} {...register("agenda")} />
      </div>
    </FormSheet>
  );
}
