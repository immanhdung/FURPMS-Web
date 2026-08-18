import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink, FileText, Gavel, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { useProposalQuery } from "@/hooks/useProposals";
import { useReviewRoundsQuery } from "@/hooks/useReviewRounds";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksQuery } from "@/hooks/useTracks";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { useContractsQuery } from "@/hooks/useContracts";
import { ProposalSummaryView } from "@/features/pi/proposals/ProposalSummaryView";
import { ExpectedProductsCard } from "@/features/pi/proposals/ExpectedProductsCard";
import { ProposalDocumentViewer } from "@/features/reviewer/proposal-review/ProposalDocumentViewer";
import { ContractMilestoneTimeline } from "@/features/staff/contracts/ContractMilestoneTimeline";
import { RoundTimeline } from "@/features/staff/proposal-reviews/RoundTimeline";
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
 * <p>Nay: tab Nội dung bày đúng thứ người xem cần — thông tin đề cương, sản phẩm cam kết, và
 * **file thuyết minh đọc được ngay tại chỗ**. Tab Tiến trình giữ timeline vòng chấm và dùng lại
 * timeline hợp đồng của PI để Staff theo dõi trọn mạch mà không tạo thêm nơi thao tác.</p>
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
  const { data: contracts, isLoading: isContractsLoading } = useContractsQuery();

  if (!proposalId) return null;
  if (isLoading) return <PageLoader label={t("staff.loadingProposal")} />;
  if (isError || !proposal) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  const cycleName = cycles?.find((c) => c.id === proposal.cycleId)?.name;
  const trackName = tracks?.find((tr) => tr.id.toString() === proposal.trackId)?.name;
  const researchTypeName = researchTypes?.find((rt) => rt.id === proposal.researchType)?.name;
  const proposalContracts = (contracts ?? []).filter((contract) => contract.proposalId === proposal.id);

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

      <Tabs defaultValue="contents" className="gap-5">
        <TabsList>
          <TabsTrigger value="contents">
            <FileText className="size-3.5" />
            {t("staff.proposalContentsTab")}
          </TabsTrigger>
          <TabsTrigger value="progress">
            <Route className="size-3.5" />
            {t("staff.projectProgressTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contents" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">{t("staff.reviewProgressSection")}</h2>
            <RoundTimeline rounds={rounds ?? []} />
            <Button variant="link" size="sm" className="px-0" onClick={() => navigate(boardHref)}>
              {t("staff.manageRoundsLink")}
              <ExternalLink />
            </Button>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">{t("staff.contractProgressSection")}</h2>
            {isContractsLoading ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : proposalContracts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                {t("staff.noContractProgress")}
              </p>
            ) : (
              <div className="space-y-4">
                {proposalContracts.map((contract) => (
                  <article key={contract.id} className="rounded-xl border border-border bg-card/95 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {contract.contractNumber
                          ? t("reports.contractNo", { no: contract.contractNumber })
                          : t("staff.contractProgressSection")}
                      </p>
                      {contract.status && <StatusBadge status={contract.status} />}
                    </div>
                    {/* Dùng đúng timeline đang phục vụ cả Staff ở màn Hợp đồng và PI ở màn Tiến trình:
                        một nguồn dữ liệu, không sinh thêm cách hiểu thứ ba về các mốc thực hiện. */}
                    <ContractMilestoneTimeline contract={contract} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
