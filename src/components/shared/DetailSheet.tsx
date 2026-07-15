import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export interface DetailField {
  label: string;
  value: ReactNode;
}

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: DetailField[];
  isLoading?: boolean;
  footer?: ReactNode;
}

export function DetailSheet({ open, onOpenChange, title, description, fields, isLoading, footer }: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent resizable defaultWidth={480} className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          {isLoading ? (
            <div className="space-y-4 pb-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3.5 pb-4">
              {fields.map((field, index) => (
                <div key={index}>
                  <p className="text-xs font-medium text-muted-foreground">{field.label}</p>
                  <div className="mt-0.5 text-sm text-foreground">{field.value ?? "-"}</div>
                  {index < fields.length - 1 && <Separator className="mt-3.5" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {footer && <div className="border-t border-border p-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
