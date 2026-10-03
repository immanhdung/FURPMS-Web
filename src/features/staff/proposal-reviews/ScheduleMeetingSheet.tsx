import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMeetingsQuery, useScheduleMeetingMutation, useUpdateMeetingMutation } from "@/hooks/useMeetings";
import { MEETING_MODES, IN_PERSON, type Meeting } from "@/types/meeting";
import { fromDateTimeLocalInput, toDateTimeLocalInput } from "@/utils/format";

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
  /** Có giá trị ⇒ chế độ SỬA buổi họp đang có; null ⇒ đặt lịch mới. */
  meeting?: Meeting | null;
}

/**
 * Đặt lịch **và sửa** buổi họp hội đồng.
 *
 * Trước đây chỉ đặt được: Staff gõ nhầm giờ hay dán sai link Meet là kẹt, chỉ còn cách đặt buổi
 * thứ hai — hội đồng nhìn vào thấy hai lịch, không biết theo cái nào. Sửa dùng lại đúng form này
 * để hai đường không lệch ràng buộc (offline bắt buộc địa điểm…).
 */
export function ScheduleMeetingSheet({ open, onOpenChange, councilId, meeting = null }: ScheduleMeetingSheetProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(meeting);
  const scheduleMutation = useScheduleMeetingMutation(councilId);
  const updateMutation = useUpdateMeetingMutation(councilId);
  const isSubmitting = scheduleMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", platform: MEETING_MODES[0].value, meetingLink: "", location: "", scheduledAt: "", durationMinutes: 60, agenda: "" },
  });

  const platform = watch("platform");
  const isOffline = platform === IN_PERSON;

  // 04/10: lịch MỚI tự điền giờ đề xuất — muộn hơn trong hai mốc: ~1 giờ nữa (làm tròn lên 30 phút) và lúc kết
  // thúc buổi họp muộn nhất đang có lịch. BE chặn giờ quá khứ và trùng giờ thành viên; trước đây Staff tự chọn hay
  // vướng hai lỗi này. Chỉ là gợi ý — vẫn sửa được.
  const { data: allMeetings } = useMeetingsQuery();
  const suggestedStart = useMemo(() => {
    const step = 30 * 60 * 1000;
    let start = Math.ceil((Date.now() + 60 * 60 * 1000) / step) * step;
    for (const m of allMeetings ?? []) {
      if (!m.scheduledAt || (m.status ?? "").toUpperCase() === "CANCELLED") continue;
      const end = new Date(m.scheduledAt).getTime() + (m.durationMinutes ?? 60) * 60 * 1000;
      if (end > Date.now() && end > start) start = Math.ceil(end / step) * step;
    }
    return toDateTimeLocalInput(new Date(start));
  }, [allMeetings]);
  // Mở form sửa phải thấy lịch đang đặt, không thì lưu lại là ghi đè trắng.
  useEffect(() => {
    if (!open) return;
    reset(
      meeting
        ? {
            title: meeting.title ?? "",
            platform: meeting.platform ?? MEETING_MODES[0].value,
            meetingLink: meeting.meetingLink ?? "",
            location: meeting.location ?? "",
            // API trả mốc UTC; ô datetime-local hiển thị theo giờ máy — phải quy đổi, không cắt chuỗi.
            scheduledAt: toDateTimeLocalInput(meeting.scheduledAt),
            durationMinutes: meeting.durationMinutes ?? 60,
            agenda: meeting.agenda ?? "",
          }
        : { title: "", platform: MEETING_MODES[0].value, meetingLink: "", location: "", scheduledAt: "", durationMinutes: 60, agenda: "" }
    );
  }, [open, meeting, reset]);

  // Chạy SAU reset (thứ tự effect) — reset làm trống ô giờ rồi mới điền gợi ý; dữ liệu lịch tải xong sau cũng chỉ
  // điền khi ô còn trống, không đè giờ Staff đã gõ.
  useEffect(() => {
    if (open && !meeting && !getValues("scheduledAt") && suggestedStart) setValue("scheduledAt", suggestedStart);
  }, [open, meeting, suggestedStart, getValues, setValue]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      // Ô datetime-local không kèm múi giờ; gửi thẳng thì máy chủ không ghi được (500).
      scheduledAt: fromDateTimeLocalInput(values.scheduledAt) ?? values.scheduledAt,
      agenda: values.agenda || undefined,
      meetingLink: isOffline ? undefined : values.meetingLink || undefined,
      location: isOffline ? values.location || undefined : undefined,
    };
    const done = () => {
      reset();
      onOpenChange(false);
    };
    if (meeting) {
      updateMutation.mutate({ id: meeting.id, payload }, { onSuccess: done });
      return;
    }
    scheduleMutation.mutate(payload, { onSuccess: done });
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t("reviewBoard.editMeeting") : t("reviewBoard.scheduleMeeting")}
      description={isEdit ? t("reviewBoard.editMeetingHint") : t("reviewBoard.scheduleMeetingHint")}
      formId="schedule-meeting-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? t("common.save") : t("reviewBoard.scheduleMeetingBtn")}
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
          {/* Chỉ còn ô dán link. Nút "tạo link Google Meet" gắn với nền tảng cụ thể mà hệ thống
              không còn phân biệt Meet/Teams/Zoom nữa (thầy 05/08). */}
          <Input id="meeting-link" placeholder="https://..." {...register("meetingLink")} />
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
