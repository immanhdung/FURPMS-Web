import { useTranslation } from "react-i18next";
import { Ban, CircleCheck, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CouncilCandidate } from "@/types/council-candidate";

/**
 * Một dòng ứng viên hội đồng: tên + học hàm, kèm cờ cho biết vì sao nên (hoặc không thể) chọn.
 * Dùng chung giữa `AddCouncilMemberDialog` (thêm 1 người vào hội đồng có sẵn) và
 * `CreateCouncilSheet` (tạo cả gói cùng lúc) — hai đường tạo hội đồng phải hiện cùng một xếp hạng
 * chuyên môn, không lệch nhau.
 */
export function CouncilCandidateRow({ candidate, showTrack }: { candidate: CouncilCandidate; showTrack: boolean }) {
  const { t } = useTranslation();
  const blocked = candidate.hasConflictOfInterest || candidate.alreadyInCouncil;

  return (
    <span className="flex w-full flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className={cn("font-medium", blocked && "text-muted-foreground")}>{candidate.fullName}</span>
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
        <span className="text-xs text-muted-foreground">{t("staff.flagBusy", { n: candidate.activeCouncilCount })}</span>
      )}
    </span>
  );
}
