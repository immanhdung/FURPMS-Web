import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignProjectToCouncilMutation, useRemoveProjectFromCouncilMutation } from "@/hooks/useReviewBoard";
import type { ReviewBoardCouncil } from "@/types/review-board";

const NONE = "none";

interface CouncilAssignSelectProps {
  projectId: string;
  councils: ReviewBoardCouncil[];
  cycleId: number;
  trackId: number;
}

/**
 * Dropdown gán 1 đề tài vào hội đồng của vòng. Giá trị hiện tại suy từ `councils[].projectIds`.
 * Đổi = gán lại (BE tự chuyển khỏi hội đồng cũ); chọn "—" = gỡ.
 */
export function CouncilAssignSelect({ projectId, councils, cycleId, trackId }: CouncilAssignSelectProps) {
  const { t } = useTranslation();
  const assignMutation = useAssignProjectToCouncilMutation(cycleId, trackId);
  const removeMutation = useRemoveProjectFromCouncilMutation(cycleId, trackId);

  const current = councils.find((c) => c.projectIds.includes(projectId));
  const value = current?.id ?? NONE;
  const pending = assignMutation.isPending || removeMutation.isPending;

  const onChange = (next: string) => {
    if (next === value) return;
    if (next === NONE) {
      if (current) removeMutation.mutate({ councilId: current.id, projectId });
    } else {
      assignMutation.mutate({ councilId: next, projectId });
    }
  };

  return (
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
  );
}
