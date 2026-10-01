import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CandidateStatusBadge } from "@/components/shared/CouncilCandidateRow";
import { cn } from "@/lib/utils";
import type { CouncilCandidate } from "@/types/council-candidate";

interface CouncilCandidatePickerProps {
  candidates: CouncilCandidate[];
  value: string | undefined;
  onChange: (userId: string) => void;
  showTrack: boolean;
}

/**
 * Danh sách chọn ủy viên nằm NGAY trong hộp thoại, mỗi người một thẻ.
 *
 * <p><b>Vì sao thay dropdown (01/10):</b> dropdown hẹp hơn nội dung — tên + học hàm + 2 nhãn tràn
 * ra ngoài hộp thoại, nhãn nhảy dòng theo độ dài tên, và không có chỗ hiện đơn vị hay lĩnh vực đã
 * khai, thứ Phòng QLKH cần để quyết chọn ai. Thẻ thì đủ chỗ: tên, học hàm, đơn vị, lĩnh vực bên trái;
 * nhãn chuyên môn cố định bên phải.</p>
 *
 * <p>Người không chọn được (xung đột lợi ích, đã có tên) vẫn HIỆN, dồn xuống nhóm cuối — giấu đi thì
 * không ai hiểu vì sao tìm mãi không thấy một cái tên.</p>
 */
export function CouncilCandidatePicker({ candidates, value, onChange, showTrack }: CouncilCandidatePickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const { available, blocked } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hit = (c: CouncilCandidate) =>
      !q || c.fullName.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q);
    const filtered = candidates.filter(hit);
    return {
      // Giữ nguyên thứ tự máy chủ trả về — đã xếp hạng chuyên môn sẵn.
      available: filtered.filter((c) => !c.hasConflictOfInterest && !c.alreadyInCouncil),
      blocked: filtered.filter((c) => c.hasConflictOfInterest || c.alreadyInCouncil),
    };
  }, [candidates, query]);

  const card = (c: CouncilCandidate, disabled: boolean) => {
    const selected = c.userId === value;
    const details = [
      c.unitName,
      c.tracks.length > 0 ? t("staff.trackLine", { tracks: c.tracks.join(", ") }) : t("staff.noTracksDeclared"),
    ]
      .filter(Boolean)
      .join(" · ");

    return (
      <button
        key={c.userId}
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={disabled}
        onClick={() => onChange(c.userId)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-60 hover:bg-transparent"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-primary" : "border-muted-foreground/40"
          )}
        >
          {selected && <span className="size-2 rounded-full bg-primary" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-sm font-medium text-foreground">{c.fullName}</span>
            {c.academicTitle && <span className="shrink-0 text-xs text-muted-foreground">{c.academicTitle}</span>}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{details}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <CandidateStatusBadge candidate={c} showTrack={showTrack} />
          {c.activeCouncilCount > 0 && !disabled && (
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              {t("staff.flagBusy", { n: c.activeCouncilCount })}
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("staff.searchCandidate")}
          className="pl-8"
          aria-label={t("staff.searchCandidate")}
        />
      </div>

      <div role="radiogroup" className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {available.length === 0 && blocked.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("staff.noCandidateMatch")}</p>
        )}
        {available.map((c) => card(c, false))}
        {blocked.length > 0 && (
          <>
            <p className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("staff.unavailableGroup", { n: blocked.length })}
            </p>
            {blocked.map((c) => card(c, true))}
          </>
        )}
      </div>
    </div>
  );
}
