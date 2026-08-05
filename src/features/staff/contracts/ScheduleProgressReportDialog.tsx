import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScheduleProgressReportMutation,
  useProgressReportQuery,
} from "@/hooks/useProgressReports";

interface ScheduleProgressReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  reportId: string | null;
}

export function ScheduleProgressReportDialog({
  open,
  onOpenChange,
  contractId,
  reportId,
}: ScheduleProgressReportDialogProps) {
  const { t } = useTranslation();
  const scheduleMutation = useScheduleProgressReportMutation(contractId);
  const [dueDate, setDueDate] = useState("");
  const [scheduledMeetingAt, setScheduledMeetingAt] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [roundName, setRoundName] = useState("");

  /**
   * Dialog này SỬA lịch đã có, nhưng trước đây mở ra TRẮNG TRƠN — không thấy hạn nộp,
   * giờ họp, link họp đang đặt là gì. Lưu lại là ghi đè mất giá trị cũ mà không ai biết.
   */
  const { data: report } = useProgressReportQuery(open ? reportId : null);

  useEffect(() => {
    if (!open || !report) return;
    setRoundName(report.roundName ?? "");
    setDueDate(report.dueDate ? report.dueDate.slice(0, 10) : "");
    // input datetime-local cần dạng yyyy-MM-ddTHH:mm
    setScheduledMeetingAt(report.scheduledMeetingAt ? report.scheduledMeetingAt.slice(0, 16) : "");
    setMeetingLink(report.meetingLink ?? "");
  }, [open, report]);

  const reset = () => {
    setDueDate("");
    setScheduledMeetingAt("");
    setMeetingLink("");
    setRoundName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contract.scheduleReportTitle")}</DialogTitle>
          <DialogDescription>{t("contract.scheduleReportDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("contract.roundName")}</label>
            <Input
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder={t("contract.roundNamePlaceholder")}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("contract.dueDate")}</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            {/* Đặt lại ngày ở đây = GIA HẠN hạn nộp (thầy 29/07: đánh giá trúng ngày cuối thì gia hạn được). */}
            <p className="mt-1 text-xs text-muted-foreground">{t("contract.dueDateExtendHint")}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("contract.meetingDateTime")}</label>
            <Input type="datetime-local" value={scheduledMeetingAt} onChange={(e) => setScheduledMeetingAt(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("contract.meetingLink")}</label>
            <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={scheduleMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            disabled={scheduleMutation.isPending}
            onClick={() =>
              reportId &&
              scheduleMutation.mutate(
                {
                  id: reportId,
                  payload: {
                    dueDate: dueDate || undefined,
                    scheduledMeetingAt: scheduledMeetingAt || undefined,
                    meetingLink: meetingLink || undefined,
                    roundName: roundName.trim() || undefined,
                  },
                },
                {
                  onSuccess: () => {
                    reset();
                    onOpenChange(false);
                  },
                }
              )
            }
          >
            {scheduleMutation.isPending && <Loader2 className="animate-spin" />}
            {t("contract.saveSchedule")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
