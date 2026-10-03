import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouncilMembersPanel } from "@/features/staff/proposal-reviews/CouncilMembersPanel";
import { MeetingsPanel } from "@/features/staff/proposal-reviews/MeetingsPanel";
import { CouncilDecisionNoForm } from "@/features/staff/review-board/CouncilDecisionNoForm";

interface CouncilDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  councilId: string | null;
  title: string;
  /** Loại phiên — quyết định có vai Phản biện hay không. */
  roundType?: string;
}

/**
 * Chi tiết 1 hội đồng (thành viên + lịch họp) trong 1 Sheet — thay cho việc nhúng
 * inline vào board (trước đây gây "tường dài"). Chỉ render khi có councilId.
 *
 * 03/10: BỎ tab "Lịch chấm" (chia khung giờ con cho từng đề tài trong buổi họp). Tab bắt mọi khung
 * phải nằm gọn trong buổi họp — Staff phải nhập lại giờ trùng với lịch họp cho từng đề tài, trong
 * khi QĐ543 chỉ quy định HỌP hội đồng (Điều 8.3, 12.3), không có "lịch chấm" riêng. Lịch họp là đủ.
 */
export function CouncilDetailSheet({ open, onOpenChange, councilId, title, roundType }: CouncilDetailSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent resizable defaultWidth={560} className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{t("reviewBoard.councilManageDesc")}</SheetDescription>
        </SheetHeader>

        {councilId && <CouncilDecisionNoForm councilId={councilId} />}

        <ScrollArea className="flex-1 px-4">
          <div className="pb-6">
            {councilId && (
              <Tabs defaultValue="members">
                <TabsList>
                  <TabsTrigger value="members">{t("reviewBoard.members")}</TabsTrigger>
                  <TabsTrigger value="meetings">{t("reviewBoard.meetings")}</TabsTrigger>
                </TabsList>
                <TabsContent value="members">
                  <CouncilMembersPanel councilId={councilId} roundType={roundType} />
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
