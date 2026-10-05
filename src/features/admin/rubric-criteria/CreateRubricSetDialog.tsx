import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateRubricTemplateMutation } from "@/hooks/useRubricTemplates";
import { REVIEW_ROUND_TYPE } from "@/constants/statuses";

/**
 * Tạo bộ tiêu chí MỚI.
 *
 * Trước đây không hề có đường tạo bộ: chỉ có "Thêm tiêu chí", và BE gom tiêu chí vào bộ
 * ĐẦU TIÊN cùng loại vòng ⇒ mãi mãi chỉ 1 bộ mỗi loại, không thể có bộ riêng cho từng
 * (đợt + lĩnh vực) như mô hình đã thiết kế.
 *
 * Chỉ 2 loại vòng (rule #16): Xét duyệt đề cương và Nghiệm thu.
 */
export function CreateRubricSetDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateRubricTemplateMutation();

  const [name, setName] = useState("");
  const [templateType, setTemplateType] = useState<string>(REVIEW_ROUND_TYPE.REVIEW);
  const [appliesBasic, setAppliesBasic] = useState(true);
  const [appliesApplied, setAppliesApplied] = useState(true);

  const canSubmit = name.trim().length > 0 && (appliesBasic || appliesApplied);

  const submit = () =>
    createMutation.mutate(
      { name: name.trim(), templateType, appliesBasic, appliesApplied },
      {
        onSuccess: () => {
          setName("");
          onOpenChange(false);
        },
      }
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("rubricSet.createTitle")}</DialogTitle>
          <DialogDescription>{t("rubricSet.createDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("rubricSet.name")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("rubricSet.namePlaceholder")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("rubricSet.roundType")}</label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[REVIEW_ROUND_TYPE.REVIEW, REVIEW_ROUND_TYPE.ACCEPTANCE].map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`reviewBoard.type.${type}`, type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-foreground">{t("rubricSet.appliesTo")}</span>
            {([["basic", appliesBasic, setAppliesBasic], ["applied", appliesApplied, setAppliesApplied]] as const).map(
              ([key, checked, set]) => (
                <label key={key} className="flex cursor-pointer items-center gap-1.5 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-primary)]"
                    checked={checked}
                    onChange={(e) => set(e.target.checked)}
                  />
                  {key === "basic" ? t("rubricSet.basic") : t("rubricSet.applied")}
                </label>
              )
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button disabled={!canSubmit || createMutation.isPending} onClick={submit}>
            {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            {t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
