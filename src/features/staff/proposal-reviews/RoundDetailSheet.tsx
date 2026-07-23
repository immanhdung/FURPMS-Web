import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Gavel, Unlock } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpenRoundMutation } from "@/hooks/useReviewRounds";
import { CreateCouncilSheet } from "@/features/staff/proposal-reviews/CreateCouncilSheet";
import { CouncilMembersPanel } from "@/features/staff/proposal-reviews/CouncilMembersPanel";
import { MeetingsPanel } from "@/features/staff/proposal-reviews/MeetingsPanel";
import { MinutesPanel } from "@/features/reviewer/proposal-review/MinutesPanel";
import { formatDateTime } from "@/utils/format";
import { roundTitle } from "@/features/staff/proposal-reviews/round-utils";
import type { ReviewRound } from "@/types/review-round";

interface RoundDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string;
  trackId?: string | null;
  round: ReviewRound | null;
}

export function RoundDetailSheet({ open, onOpenChange, proposalId, trackId, round }: RoundDetailSheetProps) {
  const { t } = useTranslation();
  const openMutation = useOpenRoundMutation(proposalId);
  const [createCouncilOpen, setCreateCouncilOpen] = useState(false);

  if (!round) return null;

  const canOpen = !round.openedAt;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent resizable defaultWidth={640} className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{roundTitle(round, t)}</SheetTitle>
          <SheetDescription>
            {round.dimension && `${round.dimension} · `}
            {t("reviewBoard.sequence", { n: round.sequence })}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {round.status && <StatusBadge status={round.status} />}
              {round.openedAt && <span className="text-xs text-muted-foreground">{t("staff.opened", { at: formatDateTime(round.openedAt) })}</span>}
              {round.closedAt && <span className="text-xs text-muted-foreground">{t("staff.closed", { at: formatDateTime(round.closedAt) })}</span>}
              {round.result && <span className="text-xs text-muted-foreground">{t("staff.resultLabel", { value: round.result })}</span>}
            </div>

            {/* Chỉ có "Mở vòng". Kết quả vòng KHÔNG chốt thủ công ở đây —
                ra từ biên bản: Thư ký soạn → Chủ tịch duyệt & khóa (rule #12). */}
            {canOpen && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => openMutation.mutate(round.id)} disabled={openMutation.isPending}>
                  <Unlock />
                  {t("reviewBoard.openRound")}
                </Button>
              </div>
            )}

            {round.councilId ? (
              <Tabs defaultValue="members">
                <TabsList>
                  <TabsTrigger value="members">{t("reviewBoard.members")}</TabsTrigger>
                  <TabsTrigger value="meetings">{t("reviewBoard.meetings")}</TabsTrigger>
                  <TabsTrigger value="minutes">{t("reviewBoard.minutes")}</TabsTrigger>
                </TabsList>
                <TabsContent value="members">
                  <CouncilMembersPanel councilId={round.councilId} trackId={trackId} />
                </TabsContent>
                <TabsContent value="meetings">
                  <MeetingsPanel councilId={round.councilId} />
                </TabsContent>
                <TabsContent value="minutes">
                  {/* Staff không phải thành viên hội đồng → chỉ xem, không soạn/duyệt (rule #12). */}
                  <MinutesPanel councilId={round.councilId} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Gavel className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t("reviewBoard.noCouncil")}</p>
                  <p className="text-xs text-muted-foreground">{t("reviewBoard.noCouncilDesc")}</p>
                </div>
                <Button size="sm" onClick={() => setCreateCouncilOpen(true)}>
                  <Gavel />
                  {t("reviewBoard.establishCouncil")}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
      </Sheet>
      <CreateCouncilSheet open={createCouncilOpen} onOpenChange={setCreateCouncilOpen} proposalId={proposalId} round={round} />
    </>
  );
}
