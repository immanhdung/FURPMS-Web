import { useState } from "react";
import { CouncilMinutesCard } from "@/components/shared/CouncilMinutesCard";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ArrowLeft, Ban, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useProposalQuery, useWithdrawProposalMutation } from "@/hooks/useProposals";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksQuery } from "@/hooks/useTracks";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { ProposalStatusTimeline } from "@/features/pi/proposals/ProposalStatusTimeline";
import { ProposalSummaryView } from "@/features/pi/proposals/ProposalSummaryView";
import { SubmitProposalDialog } from "@/features/pi/proposals/SubmitProposalDialog";
// AI bên PI tạm ẩn 17/08 — mở lại thì bỏ chú thích ở đây VÀ ở khối render bên dưới.
// import { AiSummaryCard } from "@/features/pi/proposals/AiSummaryCard";
// import { AiConsistencyCard } from "@/features/pi/proposals/AiConsistencyCard";
// import { AiFeedbackCard } from "@/features/pi/proposals/AiFeedbackCard";
import { ExpectedProductsCard } from "@/features/pi/proposals/ExpectedProductsCard";
import { ProposalDocumentsCard } from "@/features/pi/proposals/ProposalDocumentsCard";

import { DuplicateVerdictCard } from "@/features/pi/proposals/DuplicateVerdictCard";
import { ProjectTimelinePanel } from "@/features/staff/contracts/ProjectTimelinePanel";
import { ProposalExportMenu, makeSlug } from "@/features/pi/proposals/ProposalExportMenu";
import { PROPOSAL_STATUS } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";
import { proposalTitle } from "@/utils/format";
import { researchTypeDisplayName } from "@/utils/research-type";
export function ProposalDetailPage() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: proposal, isLoading, isError, refetch, isRefetching } = useProposalQuery(proposalId ?? null);
  const { data: cycles } = useCyclesQuery();
  const { data: tracks } = useTracksQuery();
  const { data: researchTypes } = useResearchTypesQuery();
  const withdrawMutation = useWithdrawProposalMutation();

  const [submitOpen, setSubmitOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  if (isLoading) return <PageLoader label="Loading proposal..." />;
  if (isError || !proposal) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  const status = (proposal.status ?? PROPOSAL_STATUS.DRAFT).toUpperCase();
  const isDraft = status === PROPOSAL_STATUS.DRAFT;
  const canWithdraw = status === PROPOSAL_STATUS.SUBMITTED || status === PROPOSAL_STATUS.UNDER_REVIEW;

  const cycleName = cycles?.find((c) => c.id === proposal.cycleId)?.name;
  const trackName = tracks?.find((t) => t.id.toString() === proposal.trackId)?.name;
  const researchTypeName = researchTypeDisplayName(
    researchTypes?.find((rt) => rt.id === proposal.researchType),
    t
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(ROUTES.MY_PROPOSALS)}>
        <ArrowLeft />
        {t("proposal.backToList")}
      </Button>

      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {proposalTitle(proposal, t("proposal.untitled"))}
            </h1>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="flex gap-2">
          {isDraft && (
            <Button variant="outline" onClick={() => navigate(`${ROUTES.SUBMIT_PROPOSAL}/${proposal.id}`)}>
              <Pencil />
              {t("common.edit")}
            </Button>
          )}
          {isDraft && (
            <Button onClick={() => setSubmitOpen(true)}>
              <Send />
              {t("common.submit")}
            </Button>
          )}
          {canWithdraw && (
            <Button variant="destructive" onClick={() => setWithdrawOpen(true)}>
              <Ban />
              {t("proposal.withdraw")}
            </Button>
          )}
          {/* Export — only useful after the proposal has content worth exporting */}
          {!isDraft && (
            <ProposalExportMenu
              proposalId={proposal.id}
              titleSlug={makeSlug(proposalTitle(proposal, proposal.id))}
            />
          )}
        </div>
      </motion.div>

      <div className="rounded-xl border border-border bg-card/95 p-4 shadow-soft-xs">
        <ProposalStatusTimeline status={status} />
      </div>

      {/* Bị từ chối thì PI phải đọc được VÌ SAO — trước 01/10 lý do có trong API nhưng không màn nào hiện. */}
      {status === "REJECTED" && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <Ban className="size-4 shrink-0" />
            {t("proposal.rejectedTitle")}
          </p>
          <p className="mt-1.5 pl-6 text-sm text-foreground">
            {proposal.rejectionReason || t("proposal.rejectedNoReason")}
          </p>
        </div>
      )}

      {/* Biên bản hội đồng đã khoá — kết luận, góp ý, kiến nghị + tải BM04/BM12 (03/10). Trước đây PI
          không đọc được, kể cả khi hội đồng yêu cầu hoàn thiện đề cương. */}
      {!isDraft && proposal.projectId && <CouncilMinutesCard projectId={proposal.projectId} />}

      {/* Chỉ đề cương ĐÃ NỘP mới có gì để đối chiếu — bản nháp chưa vào kho rà trùng lặp. */}
      {!isDraft && <DuplicateVerdictCard proposalId={proposal.id} hideNote={status === "REJECTED"} />}

      {/* Chủ nhiệm thấy trước cả lộ trình từ lúc vừa nộp: còn những bước gì, bước nào đang tới hạn. */}
      {!isDraft && proposal.projectId && (
        <section className="space-y-3 rounded-xl border border-border bg-card/95 p-4 shadow-soft-xs">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("projectTimeline.sectionTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("projectTimeline.sectionDesc")}</p>
          </div>
          <ProjectTimelinePanel projectId={proposal.projectId} />
        </section>
      )}

      <ProposalSummaryView data={proposal} cycleName={cycleName} trackName={trackName} researchTypeName={researchTypeName} />

      {/* Sản phẩm cam kết — chỉ sửa được khi còn nháp, vì nộp xong là khoá đề cương. */}
      <ExpectedProductsCard
        proposalId={proposal.id}
        editable={isDraft}
        fundingMethod={proposal.fundingMethod}
      />

      {/* Tài liệu đính kèm — gỡ/thêm được khi còn nháp; nộp xong chỉ tải về. */}
      <ProposalDocumentsCard proposalId={proposal.id} editable={isDraft} />

      {/*
        ── AI bên PI: TẠM ẨN 17/08 ────────────────────────────────────────────────────────
        Ba thẻ AI (Đối chiếu form↔file · Tóm tắt · Góp ý) đã gỡ khỏi màn chi tiết đề cương
        của chủ nhiệm. Lý do: qua các đợt thử chưa lần nào thấy chúng giúp PI ra quyết định
        gì — PI đã biết rõ đề tài của mình, một bản tóm tắt do máy viết lại không thêm thông
        tin. AI vẫn CHẠY và vẫn có ích ở màn NGƯỜI CHẤM (`ProposalReviewWorkspace` dùng
        `AiSummaryCard` với `councilId` + `autoGenerate`) — ở đó người đọc chưa từng thấy đề
        tài nên bản tóm tắt là thứ rút ngắn thời gian thật.

        Endpoint, hook và component đều giữ nguyên — bật lại chỉ cần bỏ chú thích này.
        Ghi chú đầy đủ: docs/README.md §"Đã tạm ẩn".

      <AiConsistencyCard proposalId={proposal.id} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AiSummaryCard proposalId={proposal.id} />
        <AiFeedbackCard proposalId={proposal.id} />
      </div>
      */}

      {/* Trước 01/10 ở đây là khung "Yêu cầu thay đổi" (5 loại) — Staff duyệt xong KHÔNG có tác
          dụng gì, trùng việc với "Điều chỉnh hợp đồng" (BM07, gia hạn được tự áp dụng). Nay chỉ còn
          một đường: đề tài đã duyệt thì trỏ sang đó. */}
      {status === "APPROVED" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-soft-xs">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{t("proposal.amendPointerTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("proposal.amendPointerDesc")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.MY_AMENDMENTS)}>
            {t("proposal.amendPointerBtn")}
          </Button>
        </div>
      )}

      <SubmitProposalDialog open={submitOpen} onOpenChange={setSubmitOpen} proposalId={proposal.id} />

      <ConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        title={t("proposal.withdrawConfirmTitle")}
        description={t("proposal.withdrawConfirmDesc")}
        variant="destructive"
        confirmLabel={t("proposal.withdraw")}
        isLoading={withdrawMutation.isPending}
        onConfirm={() => withdrawMutation.mutate(proposal.id, { onSuccess: () => setWithdrawOpen(false) })}
      />
    </div>
  );
}
