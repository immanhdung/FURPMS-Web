import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarClock, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MemberRoleBadge, RoundTypeBadge } from "@/components/shared/RoleBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyMembershipsQuery } from "@/hooks/useMemberships";
import { useCouncilMeetingsQuery } from "@/hooks/useMeetings";
import { useProposalQuery } from "@/hooks/useProposals";
import { ProposalSummaryView } from "@/features/pi/proposals/ProposalSummaryView";
import { RubricScoringForm } from "@/features/reviewer/proposal-review/RubricScoringForm";
import { AiSummaryCard } from "@/features/pi/proposals/AiSummaryCard";
import { AcceptanceDossierPanel } from "@/features/reviewer/proposal-review/AcceptanceDossierPanel";
import { AcceptanceEvaluationForm } from "@/features/reviewer/proposal-review/AcceptanceEvaluationForm";
import { MinutesPanel } from "@/features/reviewer/proposal-review/MinutesPanel";
import { ProposalDocumentViewer } from "@/features/reviewer/proposal-review/ProposalDocumentViewer";
import { REVIEW_ROUND_TYPE, ROUND_STATUS } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";
import { externalUrl, formatDateTime } from "@/utils/format";

export function ProposalReviewWorkspace() {
  const { t } = useTranslation();
  const { councilId } = useParams<{ councilId: string }>();
  const navigate = useNavigate();
  const { data: memberships, isLoading } = useMyMembershipsQuery();
  const { data: meetings } = useCouncilMeetingsQuery(councilId ?? null);

  const membership = memberships?.find((m) => m.councilId === councilId);
  // Thông tin đề tài PI nhập (rule tuần 10 — reviewer cần đọc, không chỉ file đính kèm).
  const { data: proposal } = useProposalQuery(membership?.proposalId ?? null);

  if (isLoading) return <PageLoader label="Loading review..." />;

  if (!councilId || !membership) {
    return (
      <EmptyState
        title={t("reviewWorkspace.notFound")}
        description={t("reviewWorkspace.notFoundDesc")}
      />
    );
  }

  const isAcceptanceRound = membership.roundType?.toUpperCase() === REVIEW_ROUND_TYPE.ACCEPTANCE;
  /**
   * Thư ký CŨNG chấm điểm — trước đây màn này ẩn tab "Chấm điểm" với Thư ký.
   * Sai ba đường: QĐ543 **Điều 8.3.b** ghi *"các thành viên tham dự họp **cần đánh giá thẩm định**
   * đề cương"* (không trừ ai); rule #11 *"Reviewer = mọi thành viên hội đồng, chức danh chỉ là
   * field"*; và thầy 05/08 nhắc thẳng *"Thư ký có thể chấm điểm"*. BE vốn không hề chặn.
   * Ngoài ra quorum 2/3 đếm theo số phiếu — loại Thư ký ra là hội đồng nhỏ khó đủ phiếu.
   */
  // Staff must open the round before reviewers can score/evaluate it.
  const roundStatus = membership.roundStatus?.toUpperCase();
  const isRoundOpen = roundStatus === ROUND_STATUS.OPEN;

  /**
   * Vòng CHƯA mở và vòng ĐÃ XONG là hai chuyện khác hẳn nhau.
   *
   * Trước 17/08 màn này chỉ hỏi `status === OPEN`; mọi giá trị khác đều rơi vào cùng một ô trống
   * ghi "Phòng QLKH chưa mở vòng chấm này — quay lại sau khi vòng được mở". Với đề tài ĐÃ NGHIỆM
   * THU XONG (vòng PASSED) thì câu đó vừa sai vừa vô lý: hội đồng đã họp, đã chốt biên bản, kết
   * quả hiện ngay trên đầu trang là "Đạt" — mà bên dưới lại bảo chờ mở vòng.
   */
  const isRoundFinished = Boolean(roundStatus) && roundStatus !== ROUND_STATUS.OPEN && roundStatus !== ROUND_STATUS.PENDING;

  /**
   * QĐ543 Điều 12.3.b phân vai rất rõ ở vòng NGHIỆM THU:
   *   · **Phản biện** phải nhận xét bằng văn bản theo **BM10** — 4 nội dung, thang 1–5.
   *   · **Mọi thành viên có mặt** bỏ phiếu theo **BM11** — chỉ Đạt / Không đạt, không điểm.
   * Nên phiếu chấm điểm ở vòng 2 chỉ dành cho phản biện; thành viên khác dùng tab "Nghiệm thu".
   * Vòng XÉT DUYỆT thì ngược lại — Điều 8.3.b: **mọi** thành viên dự họp đều chấm (BM03).
   */
  const isOpponent = membership.memberRole?.trim().toLowerCase() === "opponent";
  const canScore = isAcceptanceRound ? isOpponent : true;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(ROUTES.ASSIGNED_REVIEWS)}>
        <ArrowLeft />
        {t("reviewWorkspace.backToAssigned")}
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {membership.proposalTitleVI || "Untitled proposal"}
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <RoundTypeBadge type={membership.roundType} />
          <MemberRoleBadge role={membership.memberRole} />
          {membership.roundStatus && <StatusBadge status={membership.roundStatus} />}
          {membership.proposalStatus && <StatusBadge status={membership.proposalStatus} />}
        </div>
      </div>

      {/* Left: the PI's submitted file, so reviewers can read it while scoring on the right. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4 lg:sticky lg:top-4">
          {/* Người chấm đọc nhiều đề tài trong thời gian ngắn → bản tóm tắt nằm ngay
              trên file gốc. Trước đây card này chỉ có ở màn PI, tức đưa nhầm người. */}
          {/* Màn CHẤM ĐIỂM: tóm tắt tự chạy sẵn, người chấm mở ra là có (thầy 05/08). */}
          {/* Có councilId ⇒ một lần bấm ra CẢ tóm tắt lẫn gợi ý điểm, thay vì bắt người chấm
              chờ hai lượt 30–60 giây liên tiếp ngay lúc hội đồng đang ngồi nhìn. */}
          {/*
            CHỈ Ở VÒNG XÉT DUYỆT (17/08).

            Hai thẻ này đều xoay quanh ĐỀ CƯƠNG: `ProposalDocumentViewer` mở file thuyết minh PI
            nộp lúc đăng ký, còn `AiSummaryCard` tóm tắt/chấm thử chính bản đề cương đó
            (`AiAdvisorService.SuggestScoresAsync` đọc `Proposals` + file đề cương, không hề đọc
            sản phẩm hay báo cáo tổng kết).

            Ở vòng NGHIỆM THU chúng vừa thừa vừa sai hướng: hội đồng đang phải kết luận đề tài
            LÀM RA ĐƯỢC GÌ, mà màn hình lại chìa ra bản kế hoạch viết từ đầu kỳ — và AI thì chấm
            cái kế hoạch ấy. Hồ sơ đúng của vòng 2 (sản phẩm · báo cáo tiến độ · BM09, kèm file
            và link mở được) nằm ở tab "Hồ sơ nghiệm thu".
          */}
          {isAcceptanceRound ? (
            /*
              Cột trái = TÀI LIỆU ĐỂ ĐỌC khi chấm. Vòng 1 là đề cương; vòng 2 phải là hồ sơ
              nghiệm thu (sản phẩm · báo cáo tiến độ · BM09), vì đó mới là thứ hội đồng căn cứ
              để kết luận. Trước đó hồ sơ nằm trong một tab bên phải, nên khi ẩn hai thẻ đề cương
              đi thì nửa màn hình bên trái trống trơn.
            */
            <AcceptanceDossierPanel councilId={councilId} proposalId={membership.proposalId} />
          ) : (
            <>
              <AiSummaryCard proposalId={membership.proposalId} councilId={councilId} autoGenerate />
              <ProposalDocumentViewer proposalId={membership.proposalId} />
            </>
          )}
        </div>

        <div className="space-y-5">
          {meetings && meetings.length > 0 && (
            <div className="space-y-2">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{meeting.title ?? t("reviewWorkspace.councilMeeting")}</span>
                    <span className="text-muted-foreground">
                      · {formatDateTime(meeting.scheduledAt)} · {meeting.durationMinutes}min
                      {meeting.platform && ` · ${meeting.platform}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.status && <StatusBadge status={meeting.status} />}
                    {meeting.meetingLink && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={externalUrl(meeting.meetingLink)} target="_blank" rel="noreferrer">
                          <ExternalLink />
                          {t("reviewWorkspace.joinMeeting")}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">{t("reviewWorkspace.tabInfo")}</TabsTrigger>
              {/* Nghiệm thu phải nhìn được đề tài ĐÃ LÀM RA GÌ, không chỉ đề cương như vòng 1. */}
              {/* Tab "Hồ sơ nghiệm thu" đã chuyển sang CỘT TRÁI (17/08) — để ở cả hai là hai chỗ cùng nội dung. */}
              {/*
                Vòng NGHIỆM THU không có thang điểm — QĐ543 Biểu mẫu 11 ("Phiếu đánh giá nghiệm
                thu") chỉ có ĐẠT / KHÔNG ĐẠT + lý do, không một tiêu chí hay con số nào; Biểu mẫu
                12 cũng chỉ đếm số phiếu Đạt/Không đạt/Xuất sắc. Chấm theo thang 100 là thứ quy
                định KHÔNG có. Tab "Nghiệm thu" bên cạnh đã làm đúng BM11 rồi.
                Bày tab này ở vòng nghiệm thu chỉ dẫn tới ô trống "Chưa cấu hình tiêu chí chấm".
              */}
              {canScore && <TabsTrigger value="scoring">{t("reviewWorkspace.tabScoring")}</TabsTrigger>}
              {isAcceptanceRound && <TabsTrigger value="acceptance">{t("reviewWorkspace.tabAcceptance")}</TabsTrigger>}
              <TabsTrigger value="minutes">{t("reviewWorkspace.tabMinutes")}</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              {proposal ? (
                <ProposalSummaryView data={proposal} />
              ) : (
                <p className="text-sm text-muted-foreground">{t("reviewWorkspace.loadingInfo")}</p>
              )}
            </TabsContent>

            {canScore && (
            <TabsContent value="scoring">
              {isRoundOpen ? (
                <RubricScoringForm councilId={councilId} proposalId={membership.proposalId} projectId={membership.projectId} />
              ) : (
                <EmptyState
                  icon={Lock}
                  title={t(isRoundFinished ? "reviewWorkspace.roundFinished" : "reviewWorkspace.roundNotOpen")}
                  description={t(isRoundFinished ? "reviewWorkspace.roundFinishedDesc" : "reviewWorkspace.roundNotOpenDesc")}
                />
              )}
            </TabsContent>
            )}

            {isAcceptanceRound && (
              <TabsContent value="acceptance">
                {isRoundOpen ? (
                  <AcceptanceEvaluationForm councilId={councilId} />
                ) : (
                  <EmptyState
                    icon={Lock}
                    title={t(isRoundFinished ? "reviewWorkspace.roundFinished" : "reviewWorkspace.roundNotOpen")}
                    description={t(isRoundFinished ? "reviewWorkspace.roundFinishedDesc" : "reviewWorkspace.roundNotOpenDesc")}
                  />
                )}
              </TabsContent>
            )}

            <TabsContent value="minutes">
              <MinutesPanel councilId={councilId} memberRole={membership.memberRole} projectId={membership.projectId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
