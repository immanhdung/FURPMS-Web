import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  formId: string;
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "gradient";
  /** Độ rộng ban đầu (px). Form có danh sách dài (vd tạo hội đồng) cần rộng hơn 480 mặc định. */
  width?: number;
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  formId,
  submitVariant = "gradient",
  width = 480,
}: FormSheetProps) {
  // Mặc định của hai nút này vốn là "Save"/"Cancel" — mọi sheet tạo/sửa không tự đặt nhãn đều lòi
  // tiếng Anh ra giữa giao diện tiếng Việt.
  const { t } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent resizable defaultWidth={width} className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {/* Lớp trong của ScrollArea (Radix) là display:table nên nội dung dài đẩy rộng form thay vì xuống dòng/cắt chữ (03/10: thẻ chọn người tràn ngang). Ép về block. */}
        <ScrollArea className="flex-1 px-4 [&_[data-radix-scroll-area-viewport]>div]:!block">
          <form id={formId} onSubmit={onSubmit} noValidate className="space-y-4 pb-4">
            {children}
          </form>
        </ScrollArea>

        <SheetFooter className="border-t border-border">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" form={formId} variant={submitVariant} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {submitLabel ?? t("common.save")}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

