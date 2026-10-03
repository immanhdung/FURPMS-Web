import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUp, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { academicProfileService } from "@/services/api/academic-profile.service";
import { academicWorkService } from "@/services/api/academic-work.service";
import { academicWorkKeys } from "@/hooks/useAcademicWorks";
import { academicProfileKeys } from "@/hooks/useAcademicProfile";
import type { ExtractedCv } from "@/types/academic-profile";
import type { AcademicWorkPayload } from "@/types/academic-work";
import type { ApiError } from "@/types/common";

/**
 * "Điền từ CV" (03/10): tải CV / lý lịch khoa học (PDF, DOCX) → AI đọc → điền sẵn các ô của form.
 * AI chỉ ĐIỀN SẴN: người dùng xem lại rồi tự bấm "Lưu lý lịch khoa học"; công trình đọc được hiện thành
 * danh sách, chỉ thêm vào lý lịch khi người dùng bấm thêm.
 */
export function CvAutofill({ userId, onFill }: { userId: string; onFill: (cv: ExtractedCv) => number }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [works, setWorks] = useState<ExtractedCv["works"]>([]);
  const [adding, setAdding] = useState(false);

  const read = async (file: File) => {
    setReading(true);
    try {
      const cv = await academicProfileService.extractCv(userId, file);
      if (cv.warning) {
        toast.warning(cv.warning);
        return;
      }
      const n = onFill(cv);
      setWorks(cv.works ?? []);
      toast.success(t("cvAutofill.filled", { n, works: cv.works?.length ?? 0 }));
    } catch (error) {
      toast.error((error as ApiError).message || t("cvAutofill.failed"));
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addWorks = async () => {
    setAdding(true);
    let ok = 0;
    for (const w of works) {
      const payload: AcademicWorkPayload = {
        workType: w.workType,
        category: w.category,
        title: w.title,
        venue: w.venue ?? null,
        authors: w.authors ?? null,
        role: null,
        year: w.year ?? null,
        startYear: null,
        identifier: null,
        volume: null,
        pages: null,
        status: null,
        url: null,
        note: null,
        sortOrder: w.sortOrder ?? 0,
      };
      try {
        await academicWorkService.create(userId, payload);
        ok++;
      } catch {
        /* bỏ qua dòng lỗi, đếm phần thêm được */
      }
    }
    setAdding(false);
    setWorks([]);
    queryClient.invalidateQueries({ queryKey: academicWorkKeys.byUser(userId) });
    queryClient.invalidateQueries({ queryKey: academicProfileKeys.byUser(userId) });
    toast.success(t("cvAutofill.worksAdded", { n: ok }));
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Sparkles className="size-4 shrink-0 text-primary" />
          {t("cvAutofill.hint")}
        </p>
        <Button type="button" size="sm" variant="outline" disabled={reading} onClick={() => inputRef.current?.click()}>
          {reading ? <Loader2 className="animate-spin" /> : <FileUp />}
          {reading ? t("cvAutofill.reading") : t("cvAutofill.button")}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && read(e.target.files[0])}
        />
      </div>

      {works.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">{t("cvAutofill.worksFound", { n: works.length })}</p>
          <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
            {works.map((w, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="text-foreground">{w.title}</span>
                {[t(`academicWorks.category.${w.category}`, { defaultValue: w.category }), w.venue, w.year]
                  .filter(Boolean)
                  .map((x) => ` · ${x}`)
                  .join("")}
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setWorks([])}>
              {t("common.cancel")}
            </Button>
            <Button type="button" size="sm" disabled={adding} onClick={addWorks}>
              {adding ? <Loader2 className="animate-spin" /> : <Plus />}
              {t("cvAutofill.addWorks", { n: works.length })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
