import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProposalQuery } from "@/hooks/useProposals";
import { ProposalDocumentViewer } from "@/features/reviewer/proposal-review/ProposalDocumentViewer";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/utils/format";
import type { ProposalDetail } from "@/types/proposal-detail";

/** BE trả `ProposalDto` (kế thừa phần tóm tắt) — mấy trường này có trong JSON dù type gốc chưa khai. */
type ProposalWithSummary = ProposalDetail & {
  principalInvestigatorName?: string | null;
  cycleName?: string | null;
  trackName?: string | null;
};

/**
 * Xem nhanh một đề tài ngay trên màn "Hội đồng & Chấm".
 *
 * <p><b>Vì sao (01/10):</b> danh sách "Đề tài trong vòng" chỉ có mỗi cái tên — muốn biết đề tài nói gì,
 * ai làm, kinh phí bao nhiêu trước khi gán hội đồng thì phải mở tab khác tra. Khung này mở ngay bên
 * phải, đọc được cả file thuyết minh, có nút sang trang đầy đủ khi cần.</p>
 */
export function ProposalQuickViewSheet({
  proposalId,
  onOpenChange,
}: {
  proposalId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useProposalQuery(proposalId);
  const p = data as ProposalWithSummary | undefined;

  const facts: [string, string | null | undefined][] = [
    [t("reviewBoard.quick.pi"), p?.principalInvestigatorName],
    [t("reviewBoard.quick.budget"), p?.totalBudget != null ? formatCurrency(p.totalBudget) : null],
    [t("reviewBoard.quick.duration"), p?.durationMonths ? t("reviewBoard.quick.months", { n: p.durationMonths }) : null],
    [t("reviewBoard.quick.cycle"), [p?.cycleName, p?.trackName].filter(Boolean).join(" · ") || null],
  ];
  const sections: [string, string | null | undefined][] = [
    [t("reviewBoard.quick.objectives"), p?.objectives],
    [t("reviewBoard.quick.expected"), p?.expectedOutput],
    [t("reviewBoard.quick.urgency"), p?.urgency],
  ];

  return (
    <Sheet open={Boolean(proposalId)} onOpenChange={onOpenChange}>
      <SheetContent resizable defaultWidth={680} className="flex w-full flex-col overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="pr-6 leading-snug">
            {isLoading ? <Skeleton className="h-6 w-3/4" /> : p?.titleVI ?? t("reviewBoard.quick.title")}
          </SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-wrap items-center gap-2">
              {p?.titleEN && <span className="text-sm text-muted-foreground">{p.titleEN}</span>}
              {p?.status && <StatusBadge status={p.status} />}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <>
              <dl className="grid grid-cols-1 gap-3 rounded-xl border border-border p-3 sm:grid-cols-2">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium text-foreground">{value || "—"}</dd>
                  </div>
                ))}
              </dl>

              {sections
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <section key={label} className="space-y-1">
                    <h3 className="text-sm font-medium text-foreground">{label}</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{value}</p>
                  </section>
                ))}

              <section className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">{t("reviewBoard.quick.document")}</h3>
                {proposalId && <ProposalDocumentViewer proposalId={proposalId} />}
              </section>

              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => proposalId && navigate(`${ROUTES.PROPOSAL_REVIEWS}/${proposalId}`)}
              >
                <ExternalLink className="size-4" />
                {t("reviewBoard.quick.openFull")}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
