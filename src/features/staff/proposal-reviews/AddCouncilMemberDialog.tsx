import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Ban, CircleCheck, CircleHelp, Loader2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddCouncilMemberMutation } from "@/hooks/useCouncilMembers";
import { useCouncilCandidatesQuery } from "@/hooks/useCouncilCandidates";
import { cn } from "@/lib/utils";
import type { CouncilCandidate } from "@/types/council-candidate";

/*
 * Chức danh trong hội đồng — PHẢI khớp `review-board/CreateCouncilSheet` và các chỗ BE so chuỗi:
 * gửi thư mời kiểm "Chair"/"Secretary", màn chấm nghiệm thu kiểm "Opponent" (chỉ phản biện mới
 * viết BM10 — QĐ543 Điều 12.3.b).
 */
const COUNCIL_MEMBER_ROLES = ["Chair", "Secretary", "Member", "Opponent"];

interface AddCouncilMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  councilId: string;
  trackId?: string | null;
}

/**
 * Thêm ủy viên hội đồng — danh sách **xếp hạng theo chuyên môn** (QĐ543 Điều 8.2).
 *
 * <p><b>Thay cho nút "Gợi ý AI" cũ (26/08).</b> Nút đó gọi `/ai/suggest-reviewers`, một endpoint
 * <b>chưa bao giờ tồn tại ở máy chủ</b> — bấm vào là 404. Nay dùng
 * `GET /api/councils/candidates`: một phép nối bảng người ↔ lĩnh vực rồi sắp xếp, và được gọi đúng
 * tên như vậy chứ không dán nhãn AI cho một truy vấn SQL.</p>
 *
 * <p>Danh sách <b>vẫn hiện</b> người không chọn được (xung đột lợi ích, đã có tên) — giấu đi thì
 * Phòng QLKH không hiểu vì sao tìm mãi không thấy một cái tên.</p>
 */
export function AddCouncilMemberDialog({ open, onOpenChange, councilId }: AddCouncilMemberDialogProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useCouncilCandidatesQuery({ councilId }, open);
  const addMutation = useAddCouncilMemberMutation(councilId);

  const [userId, setUserId] = useState<string | undefined>();
  const [memberRole, setMemberRole] = useState<string>(COUNCIL_MEMBER_ROLES[2]);
  const [expertiseNote, setExpertiseNote] = useState("");

  const candidates = data?.candidates ?? [];
  const selected = candidates.find((c) => c.userId === userId);

  // Ngoài lĩnh vực = khác ngành HOẶC chưa khai gì. Cả hai đều cần Phòng QLKH giải trình, nhưng
  // câu chữ phải nói đúng trường hợp nào.
  const needsOverride = Boolean(selected && !selected.matchesTrack && data?.trackId != null);
  const noteMissing = needsOverride && !expertiseNote.trim();

  const reset = () => {
    setUserId(undefined);
    setMemberRole(COUNCIL_MEMBER_ROLES[2]);
    setExpertiseNote("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("staff.addMember")}</DialogTitle>
          <DialogDescription>
            {data?.trackName
              ? t("staff.addMemberTrackDesc", {
                  track: data.trackName,
                  n: data.matchingCount,
                })
              : t("staff.addMemberDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("staff.reviewer")}
            </label>
            {isLoading ? (
              <Skeleton className="h-9 w-full rounded-md" />
            ) : (
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("staff.selectReviewer")} />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem
                      key={c.userId}
                      value={c.userId}
                      // Xung đột lợi ích và người đã có tên: hiện ra nhưng không chọn được — BE
                      // cũng chặn, đây chỉ để khỏi bấm vào rồi ăn lỗi.
                      disabled={c.hasConflictOfInterest || c.alreadyInCouncil}
                    >
                      <CandidateRow candidate={c} showTrack={data?.trackId != null} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Ngoài lĩnh vực → cảnh báo + bắt ghi lý do. KHÔNG khoá cứng: có ca cần mời chuyên gia
              liên ngành, hoặc lĩnh vực hẹp không đủ người. */}
          {needsOverride && selected && (
            <div className="rounded-lg border border-warning bg-warning/10 p-3.5">
              <p className="flex items-start gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                <span>
                  {selected.expertiseUnknown
                    ? t("staff.expertiseUnknownWarn", { name: selected.fullName })
                    : t("staff.expertiseMismatchWarn", {
                        name: selected.fullName,
                        track: data?.trackName ?? "",
                      })}
                </span>
              </p>
              <p className="mt-1.5 pl-6 text-xs text-muted-foreground">{t("staff.expertiseHint")}</p>

              <div className="mt-3 pl-6">
                <label
                  htmlFor="expertise-note"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  {t("staff.expertiseNoteLabel")} <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="expertise-note"
                  rows={2}
                  value={expertiseNote}
                  onChange={(e) => setExpertiseNote(e.target.value)}
                  placeholder={t("staff.expertiseNotePlaceholder")}
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("staff.role")}</label>
            <Select value={memberRole} onValueChange={setMemberRole}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNCIL_MEMBER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {t(`reviewBoard.role.${role}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/*
            Ô "Phản biện ngoài" đã gỡ (17/08). Cờ `isExternal` chỉ được lưu rồi trả về, KHÔNG
            luồng nào rẽ nhánh theo nó: mức thù lao riêng cho người ngoài trường đã bỏ cùng
            toàn bộ phần tính tiền (rule #15). Cột trong DB giữ nguyên, vẫn gửi false.
          */}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={addMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!userId || noteMissing || addMutation.isPending}
            title={noteMissing ? t("staff.expertiseNoteRequired") : undefined}
            onClick={() =>
              userId &&
              addMutation.mutate(
                {
                  userId,
                  memberRole,
                  isExternal: false,
                  acceptWithoutExpertise: needsOverride,
                  expertiseNote: needsOverride ? expertiseNote.trim() : undefined,
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
            {addMutation.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
            {t("staff.addMemberBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Một dòng ứng viên: tên + học hàm, kèm cờ cho biết vì sao nên (hoặc không thể) chọn. */
function CandidateRow({ candidate, showTrack }: { candidate: CouncilCandidate; showTrack: boolean }) {
  const { t } = useTranslation();
  const blocked = candidate.hasConflictOfInterest || candidate.alreadyInCouncil;

  return (
    <span className="flex w-full flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className={cn("font-medium", blocked && "text-muted-foreground")}>
        {candidate.fullName}
      </span>
      {candidate.academicTitle && (
        <span className="text-xs text-muted-foreground">{candidate.academicTitle}</span>
      )}

      {candidate.hasConflictOfInterest ? (
        <Badge variant="destructive" className="gap-1">
          <Ban className="size-3" />
          {t("staff.flagCoi")}
        </Badge>
      ) : candidate.alreadyInCouncil ? (
        <Badge variant="secondary">{t("staff.flagAlreadyIn")}</Badge>
      ) : showTrack && candidate.matchesTrack ? (
        <Badge variant="secondary" className="gap-1 text-success">
          <CircleCheck className="size-3" />
          {t("staff.flagOnTrack")}
        </Badge>
      ) : showTrack && candidate.expertiseUnknown ? (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <CircleHelp className="size-3" />
          {t("staff.flagUnknownTrack")}
        </Badge>
      ) : showTrack ? (
        <Badge variant="outline" className="text-muted-foreground">
          {t("staff.flagOffTrack")}
        </Badge>
      ) : null}

      {candidate.activeCouncilCount > 0 && !blocked && (
        <span className="text-xs text-muted-foreground">
          {t("staff.flagBusy", { n: candidate.activeCouncilCount })}
        </span>
      )}
    </span>
  );
}
