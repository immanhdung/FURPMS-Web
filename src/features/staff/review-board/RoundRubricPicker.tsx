import { useTranslation } from "react-i18next";
import { ListChecks } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRubricTemplatesFullQuery, useSetRoundRubricMutation } from "@/hooks/useRubricTemplates";
import type { ReviewBoardRound } from "@/types/review-board";

const INHERIT = "__inherit__";

/**
 * Chọn bộ tiêu chí cho RIÊNG vòng này. Mỗi vòng có thể dùng bộ khác nhau, hoặc nhiều vòng cùng
 * dùng 1 bộ. Để "Theo đợt & lĩnh vực" (mặc định) thì vòng dùng bộ đã gắn ở cấu hình bộ tiêu chí.
 * Chỉ liệt kê bộ CÙNG loại vòng để khỏi gắn nhầm bộ nghiệm thu vào vòng xét duyệt.
 */
export function RoundRubricPicker({
  round,
  cycleId,
  trackId,
}: {
  round: ReviewBoardRound;
  cycleId: number;
  trackId: number;
}) {
  const { t } = useTranslation();
  const { data: templates } = useRubricTemplatesFullQuery();
  const mutation = useSetRoundRubricMutation(cycleId, trackId);

  const options = (templates ?? []).filter(
    (tpl) => tpl.isActive && tpl.templateType?.toUpperCase() === round.roundType?.toUpperCase()
  );

  return (
    <div className="flex items-center gap-1.5">
      <ListChecks className="size-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{t("rubricSet.forThisRound")}</span>
      <Select
        value={round.rubricTemplateId ? String(round.rubricTemplateId) : INHERIT}
        onValueChange={(v) =>
          mutation.mutate({ roundId: round.id, templateId: v === INHERIT ? null : Number(v) })
        }
        disabled={mutation.isPending}
      >
        <SelectTrigger className="h-7 w-56 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={INHERIT}>{t("rubricSet.inherit")}</SelectItem>
          {options.map((tpl) => (
            <SelectItem key={tpl.id} value={String(tpl.id)}>
              {tpl.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
