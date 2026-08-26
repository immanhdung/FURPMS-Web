import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSetRoundDeadlineMutation } from "@/hooks/useReviewRounds";

/** Chỉ cần đúng ba trường này — dùng chung được cho cả `ReviewRound` lẫn `ReviewBoardRound`. */
export interface DeadlineTargetRound {
  id: string;
  roundNumber: number;
  scoringDeadline?: string | null;
}

/**
 * Đặt hoặc DỜI hạn chấm của một vòng.
 *
 * <p>Hai chế độ khác nhau về bản chất, nên giao diện cũng phải khác:</p>
 * <ul>
 *   <li><b>Đặt lần đầu</b> (vòng chưa có hạn) — chỉ cần chọn ngày.</li>
 *   <li><b>Dời hạn đã có</b> — <b>bắt buộc</b> ghi lý do, vì rule #19 lưu mỗi lần dời thành một
 *   dòng <c>deadline_extension</c>; không có lý do thì sổ gia hạn chỉ còn là danh sách ngày trơ,
 *   sau này không ai truy được vì sao lùi.</li>
 * </ul>
 */
export function SetRoundDeadlineDialog({
  round,
  invalidateKeys,
  open,
  onOpenChange,
}: {
  round: DeadlineTargetRound | null;
  /** Xem chú thích ở `useSetRoundDeadlineMutation` — mỗi màn làm mới đúng dữ liệu nó đang xem. */
  invalidateKeys: readonly (readonly unknown[])[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const mutation = useSetRoundDeadlineMutation(invalidateKeys);

  const [deadline, setDeadline] = useState("");
  const [reason, setReason] = useState("");

  const isExtending = Boolean(round?.scoringDeadline);

  // Mở lại hộp thoại cho vòng khác thì phải nạp lại giá trị, không giữ chữ của lần trước.
  useEffect(() => {
    if (open) {
      setDeadline(round?.scoringDeadline ?? "");
      setReason("");
    }
  }, [open, round?.scoringDeadline]);

  if (!round) return null;

  const canSubmit = Boolean(deadline) && (!isExtending || reason.trim().length > 0);

  const submit = () => {
    mutation.mutate(
      { roundId: round.id, payload: { scoringDeadline: deadline, reason: reason.trim() || undefined } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isExtending ? t("roundDeadline.extendTitle") : t("roundDeadline.setTitle")}
          </DialogTitle>
          <DialogDescription>
            {isExtending
              ? t("roundDeadline.extendDesc", { date: round.scoringDeadline })
              : t("roundDeadline.setDesc", { n: round.roundNumber })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="round-deadline" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t("roundDeadline.field")}
            </label>
            <Input
              id="round-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {isExtending && (
            <div className="space-y-1.5">
              <label htmlFor="round-deadline-reason" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t("roundDeadline.reason")}
              </label>
              <Textarea
                id="round-deadline-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("roundDeadline.reasonPlaceholder")}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{t("roundDeadline.reasonHint")}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={!canSubmit || mutation.isPending}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
