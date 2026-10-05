import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAssignProjectToCouncilMutation, useRemoveProjectFromCouncilMutation } from "@/hooks/useReviewBoard";
import type { ReviewBoardCouncil } from "@/types/review-board";

const NONE = "none";

// Chuỗi đánh dấu lỗi "chuyên môn" trong câu BE trả về — BE dùng chung mã VALIDATION_FAILED cho mọi
// ArgumentException, nên chưa có errorCode riêng để so; QĐ543 Điều 8.2 chỉ xuất hiện trong đúng
// thông báo này (xem ReviewShared.AssertExpertiseAsync), nên đủ để nhận diện không lẫn với lỗi khác.
const EXPERTISE_MARKER = "Điều 8.2";

interface CouncilAssignSelectProps {
  projectId: string;
  councils: ReviewBoardCouncil[];
  cycleId: number;
  trackId: number;
}

/**
 * Dropdown gán 1 đề tài vào hội đồng của vòng. Giá trị hiện tại suy từ `councils[].projectIds`.
 * Đổi = gán lại (BE tự chuyển khỏi hội đồng cũ); chọn "—" = gỡ.
 *
 * <p><b>Ngoại lệ chuyên môn (26/08).</b> Hội đồng lập kiểu "trọn gói" luôn tạo với 0 đề tài rồi gán
 * qua đây — nên đây mới là chỗ chuyên môn của thành viên đã có thật sự bị đối chiếu với đề tài. Bị
 * chặn thì mở hộp thoại xin lý do ngay tại chỗ, không bắt Staff quay lại màn khác.</p>
 */
export function CouncilAssignSelect({ projectId, councils, cycleId, trackId }: CouncilAssignSelectProps) {
  const { t } = useTranslation();
  const assignMutation = useAssignProjectToCouncilMutation(cycleId, trackId);
  const removeMutation = useRemoveProjectFromCouncilMutation(cycleId, trackId);

  const [blocked, setBlocked] = useState<{ councilId: string; message: string } | null>(null);
  const [note, setNote] = useState("");

  const current = councils.find((c) => c.projectIds.includes(projectId));
  const value = current?.id ?? NONE;
  const pending = assignMutation.isPending || removeMutation.isPending;

  const onChange = (next: string) => {
    if (next === value) return;
    if (next === NONE) {
      if (current) removeMutation.mutate({ councilId: current.id, projectId });
      return;
    }
    assignMutation.mutate(
      { councilId: next, projectId },
      {
        onError: (error) => {
          if (error.message?.includes(EXPERTISE_MARKER)) {
            setBlocked({ councilId: next, message: error.message });
            setNote("");
          } else {
            toast.error(error.message || t("toast.projectAssignFailed"));
          }
        },
      }
    );
  };

  const confirmOverride = () => {
    if (!blocked || !note.trim()) return;
    assignMutation.mutate(
      { councilId: blocked.councilId, projectId, acceptWithoutExpertise: true, expertiseNote: note.trim() },
      {
        onError: (error) => toast.error(error.message || t("toast.projectAssignFailed")),
        onSuccess: () => setBlocked(null),
      }
    );
  };

  return (
    <>
      <Select value={value} onValueChange={onChange} disabled={pending || councils.length === 0}>
        <SelectTrigger className="h-8 w-40 shrink-0">
          <SelectValue placeholder={t("reviewBoard.unassigned")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{t("reviewBoard.unassigned")}</SelectItem>
          {councils.map((c, i) => (
            <SelectItem key={c.id} value={c.id}>
              {t("reviewBoard.councilN", { n: i + 1 })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={blocked != null} onOpenChange={(open) => !open && setBlocked(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              {t("staff.expertiseNoteLabel")}
            </DialogTitle>
            <DialogDescription>{blocked?.message}</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("staff.expertiseNotePlaceholder")}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBlocked(null)} disabled={assignMutation.isPending}>
              {t("common.cancel")}
            </Button>
            <Button type="button" disabled={!note.trim() || assignMutation.isPending} onClick={confirmOverride}>
              {t("reviewBoard.assignAnyway")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
