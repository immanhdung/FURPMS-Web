import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileBadge, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCouncilQuery, useUpdateCouncilMutation } from "@/hooks/useCouncils";

/**
 * Số và ngày của Quyết định thành lập hội đồng (QĐ543 Điều 8.1 / 12.1 — Hiệu trưởng ra quyết định).
 *
 * <p>Máy chủ đã nhận hai trường này từ lâu nhưng KHÔNG màn nào cho nhập (03/10) — nên biên bản
 * BM04/BM12 xuất ra luôn "Quyết định số ……/QĐ-ĐHFPT, ngày … tháng … năm …".</p>
 */
export function CouncilDecisionNoForm({ councilId }: { councilId: string }) {
  const { t } = useTranslation();
  const { data: council } = useCouncilQuery(councilId);
  const update = useUpdateCouncilMutation(councilId);
  const [no, setNo] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);

  const savedNo = council?.establishmentDecisionNo ?? "";
  const savedDate = council?.establishedAt?.slice(0, 10) ?? "";
  const curNo = no ?? savedNo;
  const curDate = date ?? savedDate;
  const dirty = curNo !== savedNo || curDate !== savedDate;

  return (
    <div className="mx-4 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <FileBadge className="size-4 text-primary" />
        {t("reviewBoard.decision.title")}
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-40 flex-1">
          <span className="mb-1 block text-xs text-muted-foreground">{t("reviewBoard.decision.no")}</span>
          <Input
            value={curNo}
            onChange={(e) => setNo(e.target.value)}
            placeholder={t("reviewBoard.decision.noPlaceholder")}
            className="h-8"
          />
        </label>
        <label className="w-40">
          <span className="mb-1 block text-xs text-muted-foreground">{t("reviewBoard.decision.date")}</span>
          <Input type="date" value={curDate} onChange={(e) => setDate(e.target.value)} className="h-8" />
        </label>
        <Button
          type="button"
          size="sm"
          disabled={!dirty || update.isPending}
          onClick={() =>
            update.mutate(
              { establishmentDecisionNo: curNo.trim(), ...(curDate ? { establishedAt: curDate } : {}) },
              {
                onSuccess: () => {
                  setNo(null);
                  setDate(null);
                },
              }
            )
          }
        >
          {update.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {t("common.save")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t("reviewBoard.decision.hint")}</p>
    </div>
  );
}
