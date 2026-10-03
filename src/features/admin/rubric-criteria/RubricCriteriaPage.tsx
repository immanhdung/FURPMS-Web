import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ListChecks, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REVIEW_ROUND_TYPE } from "@/constants/statuses";
import { RubricTemplatesPanel } from "@/features/admin/rubric-criteria/RubricTemplatesPanel";
import { CreateRubricSetDialog } from "@/features/admin/rubric-criteria/CreateRubricSetDialog";

/**
 * Quản lý bộ tiêu chí chấm.
 *
 * Trang này trước đây có HAI phần rời nhau và người dùng không hiểu phần nào làm gì:
 * danh sách "bộ tiêu chí" ở trên (chỉ xem, không sửa được tiêu chí bên trong) và một
 * bảng phẳng "tất cả tiêu chí" ở dưới (sửa được nhưng gom theo LOẠI VÒNG, không biết
 * thuộc bộ nào). Tệ hơn: endpoint của bảng phẳng luôn gắn tiêu chí vào bộ ĐẦU TIÊN
 * cùng loại vòng ⇒ bộ thứ hai vĩnh viễn rỗng.
 *
 * Nay gộp làm một: mỗi bộ tự quản tiêu chí của mình, thêm/sửa/xoá ngay tại chỗ.
 */
export function RubricCriteriaPage() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  // Hai loại phiếu khác hẳn nhau (BM03 chấm điểm cộng 100 / BM10 chấm mức 1–5) ⇒ tách tab như
  // màn Đợt nghiên cứu, thay vì một bộ lọc "loại vòng" trộn chung một danh sách.
  const [roundType, setRoundType] = useState<string>(REVIEW_ROUND_TYPE.REVIEW);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <ListChecks className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("rubricCriteria.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("rubricSet.pageSubtitle")}</p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          {t("rubricSet.createBtn")}
        </Button>
      </motion.div>

      <Tabs value={roundType} onValueChange={setRoundType}>
        <TabsList>
          {[REVIEW_ROUND_TYPE.REVIEW, REVIEW_ROUND_TYPE.ACCEPTANCE].map((type) => (
            <TabsTrigger key={type} value={type}>
              {t(`reviewBoard.type.${type}`, type)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <RubricTemplatesPanel roundType={roundType} />

      <CreateRubricSetDialog open={createOpen} onOpenChange={setCreateOpen} defaultType={roundType} />
    </div>
  );
}
