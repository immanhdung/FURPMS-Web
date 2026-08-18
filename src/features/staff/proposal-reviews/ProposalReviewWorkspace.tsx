import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { useProposalQuery } from "@/hooks/useProposals";
import { useReviewRoundsQuery } from "@/hooks/useReviewRounds";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksQuery } from "@/hooks/useTracks";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { ProposalSummaryView } from "@/features/pi/proposals/ProposalSummaryView";
import { ExpectedProductsCard } from "@/features/pi/proposals/ExpectedProductsCard";
import { ProposalDocumentViewer } from "@/features/reviewer/proposal-review/ProposalDocumentViewer";
import { ROUTES } from "@/constants/routes";
import { proposalTitle } from "@/utils/format";

/**
 * Chi tiết một ĐỀ CƯƠNG, nhìn từ phía Phòng QLKH — **đọc được đề cương ghi những gì**.
 *
 * <p><b>Đổi 18/08.</b> Trước đây màn này là bảng Kanban + dòng thời gian quản lý vòng chấm của
 * riêng đề tài: mở chi tiết một đề cương ra thì thấy đúng mấy cái thẻ vòng, **không một dòng nội
 * dung nào** của đề cương. Trong khi việc quản lý vòng chấm đã có màn *Hội đồng & Chấm* làm đầy đủ
 * hơn (chọn đợt + lĩnh vực, tạo vòng cấp lĩnh vực, lập hội đồng, gán rubric, thêm đề tài vào vòng)
 * ⇒ hai chỗ làm cùng một việc, chỗ này là bản cũ và yếu hơn.</p>
 *
 * <p>Nay: bày đúng thứ người xem cần — thông tin đề cương, sản phẩm cam kết, và **file thuyết minh
 * đọc được ngay tại chỗ**. Vòng chấm chỉ còn liệt kê gọn để biết đề tài đang ở đâu, kèm đường dẫn
 * sang màn Hội đồng & Chấm để thao tác.</p>
 */
export function ProposalReviewWorkspace() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: proposal, isLoading, isError, refetch, isRefetching } = useProposalQuery(proposalId ?? null);
  const { data: rounds } = useReviewRoundsQuery(proposalId ?? null);
  const { data: cycles } = useCyclesQuery();
  const { data: tracks } = useTracksQuery();
  const { data: researchTypes } = useResearchTypesQuery();

  if (!proposalId) return null;
  if (isLoading) return <PageLoader label={t("staff.loadingProposal")} />;
  if (isError || !proposal) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  const cycleName = cycles?.find((c) => c.id === proposal.cycleId)?.name;
  const trackName = tracks?.find((tr) => tr.id.toString() === proposal.trackId)?.name;
  const researchTypeName = researchTypes?.find((rt) => rt.id === proposal.researchType)?.name;

  // Sang màn Hội đồng & Chấm đã lọc sẵn đúng đợt + lĩnh vực của đề tài này (màn đó đọc bộ lọc
  // từ query string), khỏi phải chọn lại bằng tay.
  const boardHref =
    proposal.cycleId && proposal.trackId
      ? `${ROUTES.REVIEW_BOARD}?cycle=${proposal.cycleId}&track=${proposal.trackId}`
      : ROUTES.REVIEW_BOARD;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(ROUTES.PROPOSAL_REVIEWS)}>
        <ArrowLeft />
        {t("staff.backToProposals")}
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {proposalTitle(proposal, t("staff.proposalFallback"))}
            </h1>
            {proposal.status && <StatusBadge status={proposal.status} />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("staff.proposalDetailSubtitle")}</p>
        </div>

        <Button variant="outline" onClick={() => navigate(boardHref)}>
          <Gavel />
          {t("staff.openReviewBoard")}
        </Button>
      </div>

      <ProposalSummaryView
        data={proposal}
        cycleName={cycleName}
        trackName={trackName}
        researchTypeName={researchTypeName}
      />

      {/* Chỉ XEM: đề cương nộp rồi là khoá, Phòng QLKH không sửa hộ chủ nhiệm. */}
      <ExpectedProductsCard proposalId={proposal.id} editable={false} fundingMethod={proposal.fundingMethod} />

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">{t("staff.attachedDocuments")}</h2>
        {/* Đọc thẳng bản thuyết minh tại đây — cùng bộ xem hội đồng dùng, nên không phải tải file
            về máy rồi mở bằng Word chỉ để xem chủ nhiệm viết gì. */}
        <ProposalDocumentViewer proposalId={proposal.id} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">{t("staff.roundsSection")}</h2>
        {!rounds || rounds.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            {t("staff.noRounds")}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {rounds.map((round) => (
              <li key={round.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="font-medium text-foreground">
                  {t("staff.round", { num: round.roundNumber })}
                  {round.roundType
                    ? ` · ${t(`reviewBoard.type.${round.roundType}`, { defaultValue: round.roundType })}`
                    : ""}
                </span>
                <span className="flex items-center gap-2">
                  {round.dimension && (
                    <span className="text-xs text-muted-foreground">
                      {t(`reviewBoard.dim.${round.dimension}`, { defaultValue: round.dimension })}
                    </span>
                  )}
                  {round.status && <StatusBadge status={round.status} />}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Button variant="link" size="sm" className="px-0" onClick={() => navigate(boardHref)}>
          {t("staff.manageRoundsLink")}
          <ExternalLink />
        </Button>
      </section>
    </div>
  );
}
