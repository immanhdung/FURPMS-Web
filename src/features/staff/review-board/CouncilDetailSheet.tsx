import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouncilMembersPanel } from "@/features/staff/proposal-reviews/CouncilMembersPanel";
import { MeetingsPanel } from "@/features/staff/proposal-reviews/MeetingsPanel";

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
                </TabsList>
                <TabsContent value="members">
                  <CouncilMembersPanel councilId={councilId} />
                </TabsContent>
                <TabsContent value="meetings">
                  <MeetingsPanel councilId={councilId} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
