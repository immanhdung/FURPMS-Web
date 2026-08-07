import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouncilMembersPanel } from "@/features/staff/proposal-reviews/CouncilMembersPanel";
import { MeetingsPanel } from "@/features/staff/proposal-reviews/MeetingsPanel";
import { CouncilSlotsPanel } from "@/features/staff/review-board/CouncilSlotsPanel";
import { useCouncilSlotsQuery } from "@/hooks/useCouncilSlots";

interface CouncilDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  councilId: string | null;
  title: string;
}

/**
 * Chi tiết 1 hội đồng (thành viên + lịch họp) trong 1 Sheet — thay cho việc nhúng
 * inline vào board (trước đây gây "tường dài"). Chỉ render khi có councilId.
 */
export function CouncilDetailSheet({ open, onOpenChange, councilId, title }: CouncilDetailSheetProps) {
  const { t } = useTranslation();
  // Danh sách đề tài của hội đồng — dùng để quyết định có hiện tab "Lịch chấm" hay không.
  const { data: board } = useCouncilSlotsQuery(open ? councilId : null);
  const hasMultipleProjects = (board?.slots.length ?? 0) > 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent resizable defaultWidth={560} className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{t("reviewBoard.councilManageDesc")}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="pb-6">
            {councilId && (
              <Tabs defaultValue="members">
                <TabsList>
                  <TabsTrigger value="members">{t("reviewBoard.members")}</TabsTrigger>
                  <TabsTrigger value="meetings">{t("reviewBoard.meetings")}</TabsTrigger>
                  {/* Lịch chấm = chia khung giờ con CHO TỪNG ĐỀ TÀI trong một buổi họp. Hội đồng
                      chỉ có 1 đề tài thì slot trùng luôn buổi họp ⇒ tab này chỉ làm rối. */}
                  {hasMultipleProjects && (
                    <TabsTrigger value="slots">{t("reviewBoard.slots")}</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="members">
                  <CouncilMembersPanel councilId={councilId} />
                </TabsContent>
                <TabsContent value="meetings">
                  <MeetingsPanel councilId={councilId} />
                </TabsContent>
                {hasMultipleProjects && (
                  <TabsContent value="slots">
                    <CouncilSlotsPanel councilId={councilId} />
                  </TabsContent>
                )}
              </Tabs>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
