import { useTranslation } from "react-i18next";
import { Ban, CircleCheck, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CouncilCandidate } from "@/types/council-candidate";

/**
 * Nhãn cho biết vì sao nên (hoặc không thể) chọn một ứng viên. Tách riêng (01/10) để danh sách chọn
 * trong `CouncilCandidatePicker` và dòng trong dropdown dùng ĐÚNG một bộ luật hiển thị.
 */
export function CandidateStatusBadge({ candidate, showTrack }: { candidate: CouncilCandidate; showTrack: boolean }) {
  const { t } = useTranslation();

  if (candidate.hasConflictOfInterest) {
    return (
      <Badge variant="destructive" className="gap-1 whitespace-nowrap">
        <Ban className="size-3" />
        {t("staff.flagCoi")}
      </Badge>
    );
  }
  if (candidate.alreadyInCouncil) {
    return <Badge variant="secondary" className="whitespace-nowrap">{t("staff.flagAlreadyIn")}</Badge>;
  }
  if (!showTrack) return null;
  if (candidate.matchesTrack) {
    return (
      <Badge variant="secondary" className="gap-1 whitespace-nowrap text-success">
        <CircleCheck className="size-3" />
        {t("staff.flagOnTrack")}
      </Badge>
    );
  }
  if (candidate.expertiseUnknown) {
    return (
      <Badge variant="outline" className="gap-1 whitespace-nowrap text-muted-foreground">
        <CircleHelp className="size-3" />
        {t("staff.flagUnknownTrack")}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="whitespace-nowrap text-muted-foreground">
      {t("staff.flagOffTrack")}
    </Badge>
  );
}

/**
 * Một dòng ứng viên hội đồng: tên + học hàm, kèm cờ cho biết vì sao nên (hoặc không thể) chọn.
 * Dùng trong dropdown của `CreateCouncilSheet` (tạo cả gói cùng lúc) — hai đường tạo hội đồng phải
 * hiện cùng một xếp hạng chuyên môn, không lệch nhau.
 *
 * <p>01/10: tên bên trái, nhãn dồn sang phải và không xuống dòng — trước đây mọi thứ cùng `flex-wrap`
 * nên nhãn nhảy lung tung theo độ dài tên, nhìn lệch.</p>
 */
export function CouncilCandidateRow({ candidate, showTrack }: { candidate: CouncilCandidate; showTrack: boolean }) {
  const { t } = useTranslation();
  const blocked = candidate.hasConflictOfInterest || candidate.alreadyInCouncil;

  return (
    <span className="flex w-full min-w-0 items-center gap-2">
      <span className={cn("min-w-0 truncate font-medium", blocked && "text-muted-foreground")}>
        {candidate.fullName}
      </span>
      {candidate.academicTitle && (
        <span className="shrink-0 text-xs text-muted-foreground">{candidate.academicTitle}</span>
      )}
      <span className="ml-auto flex shrink-0 items-center gap-2">
        {candidate.activeCouncilCount > 0 && !blocked && (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {t("staff.flagBusy", { n: candidate.activeCouncilCount })}
          </span>
        )}
        <CandidateStatusBadge candidate={candidate} showTrack={showTrack} />
      </span>
    </span>
  );
}
