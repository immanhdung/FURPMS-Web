import { useState } from "react";
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
import { useScheduleProgressReportMutation } from "@/hooks/useProgressReports";

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
  const scheduleMutation = useScheduleProgressReportMutation(contractId);
  const [dueDate, setDueDate] = useState("");
  const [scheduledMeetingAt, setScheduledMeetingAt] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const reset = () => {
    setDueDate("");
    setScheduledMeetingAt("");
    setMeetingLink("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule progress report</DialogTitle>
          <DialogDescription>Set the due date and review meeting for this reporting period.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Due date</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Meeting date/time</label>
            <Input type="datetime-local" value={scheduledMeetingAt} onChange={(e) => setScheduledMeetingAt(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Meeting link</label>
            <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={scheduleMutation.isPending}>
            Cancel
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
            Save schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
