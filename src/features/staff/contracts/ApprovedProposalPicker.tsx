import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarRange, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { proposalTitle } from "@/utils/format";
import type { ProposalSummary } from "@/types/proposal-summary";

/**
 * Chọn đề tài đã duyệt để lập hợp đồng — danh sách THẺ mở ngay trong form, có ô tìm.
 *
 * <p><b>Vì sao thay dropdown (03/10):</b> tên đề tài dài nên dropdown tràn ra khỏi form, và khi có
 * nhiều đề tài chờ ký thì danh sách đổ dài cả màn hình. Thẻ thì xuống dòng được tên dài, hiện thêm
 * chủ nhiệm / đợt / thời gian để phân biệt các đề tài trùng tên na ná nhau; danh sách cao cố định
 * và tự cuộn.</p>
 */
export function ApprovedProposalPicker({
  proposals,
  value,
  onChange,
  invalid,
}: {
  proposals: ProposalSummary[];
  value: string;
  onChange: (id: string) => void;
  invalid?: boolean;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(!value);
  const selected = proposals.find((p) => p.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return proposals;
    return proposals.filter((p) =>
      [p.titleVI, p.titleEN, p.principalInvestigatorName, p.cycleName, p.trackName]
        .filter(Boolean)
        .some((x) => x!.toLowerCase().includes(q))
    );
  }, [proposals, query]);

  const meta = (p: ProposalSummary) => (
    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
      {p.principalInvestigatorName && (
        <span className="inline-flex items-center gap-1">
          <User className="size-3" />
          {p.principalInvestigatorName}
        </span>
      )}
      {(p.cycleName || p.trackName) && <span>{[p.cycleName, p.trackName].filter(Boolean).join(" · ")}</span>}
      {p.durationMonths ? (
        <span className="inline-flex items-center gap-1">
          <CalendarRange className="size-3" />
          {t("contract.picker.months", { n: p.durationMonths })}
        </span>
      ) : null}
    </span>
  );

  if (selected && !open) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{proposalTitle(selected, selected.id)}</p>
          {meta(selected)}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          {t("contract.picker.change")}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 rounded-xl border p-2.5", invalid ? "border-destructive" : "border-border")}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("contract.picker.search")}
          className="pl-8"
          aria-label={t("contract.picker.search")}
        />
      </div>
      <div role="radiogroup" className="max-h-64 space-y-1.5 overflow-y-auto overscroll-contain pr-1">
        {filtered.length === 0 ? (
          <p className="py-5 text-center text-sm text-muted-foreground">{t("contract.picker.noMatch")}</p>
        ) : (
          filtered.map((p) => {
            const active = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                )}
              >
                <span className="line-clamp-2 text-sm font-medium text-foreground">{proposalTitle(p, p.id)}</span>
                {meta(p)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
