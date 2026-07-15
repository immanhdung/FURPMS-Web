import { useState } from "react";
import { Gavel, Lock, Unlock } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpenRoundMutation } from "@/hooks/useReviewRounds";
import { CreateCouncilSheet } from "@/features/staff/proposal-reviews/CreateCouncilSheet";
import { CloseRoundDialog } from "@/features/staff/proposal-reviews/CloseRoundDialog";
import { CouncilMembersPanel } from "@/features/staff/proposal-reviews/CouncilMembersPanel";
import { MeetingsPanel } from "@/features/staff/proposal-reviews/MeetingsPanel";
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
  const openMutation = useOpenRoundMutation(proposalId);
  const [createCouncilOpen, setCreateCouncilOpen] = useState(false);
  const [closeRoundOpen, setCloseRoundOpen] = useState(false);

  if (!round) return null;

  const canOpen = !round.openedAt;
  const canClose = Boolean(round.openedAt) && !round.closedAt;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent resizable defaultWidth={640} className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{roundTitle(round)}</SheetTitle>
          <SheetDescription>
            {round.dimension && `${round.dimension} · `}
            Sequence {round.sequence}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {round.status && <StatusBadge status={round.status} />}
              {round.openedAt && <span className="text-xs text-muted-foreground">Opened {formatDateTime(round.openedAt)}</span>}
              {round.closedAt && <span className="text-xs text-muted-foreground">Closed {formatDateTime(round.closedAt)}</span>}
              {round.result && <span className="text-xs text-muted-foreground">Result: {round.result}</span>}
            </div>

            <div className="flex gap-2">
              {canOpen && (
                <Button size="sm" onClick={() => openMutation.mutate(round.id)} disabled={openMutation.isPending}>
                  <Unlock />
                  Open round
                </Button>
              )}
              {canClose && (
                <Button size="sm" variant="destructive" onClick={() => setCloseRoundOpen(true)}>
                  <Lock />
                  Close round
                </Button>
              )}
            </div>

            {round.councilId ? (
              <Tabs defaultValue="members">
                <TabsList>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="meetings">Meetings</TabsTrigger>
                </TabsList>
                <TabsContent value="members">
                  <CouncilMembersPanel councilId={round.councilId} trackId={trackId} />
                </TabsContent>
                <TabsContent value="meetings">
                  <MeetingsPanel councilId={round.councilId} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Gavel className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No council established</p>
                  <p className="text-xs text-muted-foreground">Create a council to add reviewers and schedule meetings.</p>
                </div>
                <Button size="sm" onClick={() => setCreateCouncilOpen(true)}>
                  <Gavel />
                  Establish council
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
      </Sheet>
      <CreateCouncilSheet open={createCouncilOpen} onOpenChange={setCreateCouncilOpen} proposalId={proposalId} round={round} />
      <CloseRoundDialog open={closeRoundOpen} onOpenChange={setCloseRoundOpen} proposalId={proposalId} round={round} />
    </>
  );
}
