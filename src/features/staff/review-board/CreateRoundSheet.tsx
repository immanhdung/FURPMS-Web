import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormSheet } from "@/components/shared/FormSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTrackRoundMutation } from "@/hooks/useReviewBoard";

// Rule tuần 10 (#16): bỏ dimension FINANCE (chỉ SCIENCE) + chỉ 2 loại vòng: Xét duyệt đề cương + Nghiệm thu.
const ROUND_TYPES = ["REVIEW", "ACCEPTANCE"];

interface CreateRoundSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: number;
  trackId: number;
}

/**
 * Tạo vòng chấm ở CẤP LĨNH VỰC — để trống projectIds, BE tự gom mọi đề tài
 * SUBMITTED/REVISION của lĩnh vực chưa vào vòng (rule: cả track chung vòng).
 */
export function CreateRoundSheet({ open, onOpenChange, cycleId, trackId }: CreateRoundSheetProps) {
  const { t } = useTranslation();
  const [roundType, setRoundType] = useState("REVIEW");
  const createMutation = useCreateTrackRoundMutation(cycleId, trackId);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    createMutation.mutate(
      { dimension: "SCIENCE", roundType }, // dimension luôn SCIENCE (bỏ FINANCE — rule #16)
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("reviewBoard.newRoundTitle")}
      description={t("reviewBoard.newRoundDesc")}
      formId="create-track-round-form"
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      submitLabel={t("reviewBoard.newRound")}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.roundType")}</label>
        <Select value={roundType} onValueChange={setRoundType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROUND_TYPES.map((rt) => (
              <SelectItem key={rt} value={rt}>
                {t(`reviewBoard.type.${rt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{t("reviewBoard.newRoundHint")}</p>
    </FormSheet>
  );
}
