import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Filter,
  Layers,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksByCycleQuery } from "@/hooks/useTracks";
import {
  useDeleteRubricTemplateMutation,
  useDeleteTemplateCriterionMutation,
  useDuplicateRubricTemplateMutation,
  useRubricTemplatesFullQuery,
  useSaveRubricScopesMutation,
  useSaveTemplateCriterionMutation,
  useUpdateRubricTemplateMutation,
} from "@/hooks/useRubricTemplates";
import type { RubricTemplateFull } from "@/types/rubric-template";

/**
 * Quản lý "Bộ tiêu chí": 1 bộ = nhiều tiêu chí, gắn cho loại đề tài (Cơ bản/Ứng dụng) và
 * cho nhiều (đợt + lĩnh vực). Mỗi (đợt + lĩnh vực + loại vòng) chỉ 1 bộ — lĩnh vực đã bị bộ
 * khác giữ thì BE trả 409 nêu rõ tên bộ đó.
 */
const isAcceptanceSet = (tpl: RubricTemplateFull) => tpl.templateType === "ACCEPTANCE";

export function RubricTemplatesPanel({ roundType }: { roundType: string }) {
  const { t } = useTranslation();
  const { data: templates, isLoading } = useRubricTemplatesFullQuery();
  const updateMutation = useUpdateRubricTemplateMutation();
  const duplicateMutation = useDuplicateRubricTemplateMutation();
  const deleteTemplateMutation = useDeleteRubricTemplateMutation();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  /**
   * Bộ lọc gom về MỘT hàng (thầy 05/08: *"filter năm, filter ứng dụng/cơ bản, cái nào cùng
   * filter thì nhóm lại"*). Trước đây không có bộ lọc nào — vài chục bộ tiêu chí đổ thẳng ra
   * một danh sách dài.
   */
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BASIC" | "APPLIED">("ALL");
  // Đổi tên bộ tại chỗ — BE cho đổi tên kể cả khi bộ đã có phiếu (tên chỉ là nhãn quản lý).
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const submitRename = (id: number) => {
    const name = nameDraft.trim();
    if (!name) return;
    updateMutation.mutate({ id, payload: { name } }, { onSuccess: () => setRenamingId(null) });
  };
  // Mặc định thu gọn tiêu chí: nhiều bộ × nhiều tiêu chí thì trang dài không đọc nổi.
  const [openCriteriaId, setOpenCriteriaId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const inTab = (templates ?? []).filter((x) => x.templateType === roundType);
  const visible = inTab.filter((x) => {
    if (typeFilter === "BASIC" && !x.appliesBasic) return false;
    if (typeFilter === "APPLIED" && !x.appliesApplied) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Mỗi tab một kiểu phiếu theo QĐ543 — nói rõ ngay đầu để Admin biết nhập gì. */}
      <p className="text-sm text-muted-foreground">
        {roundType === "ACCEPTANCE" ? t("rubricSet.hintAcceptance") : t("rubricSet.hintReview")}
      </p>

      {inTab.length === 0 ? (
        <EmptyState icon={Layers} title={t("rubricSet.none")} description={t("rubricSet.noneDesc")} />
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <Filter className="size-3.5 shrink-0 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("rubricSet.filterAllTypes")}</SelectItem>
              <SelectItem value="BASIC">{t("rubricSet.basic")}</SelectItem>
              <SelectItem value="APPLIED">{t("rubricSet.applied")}</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-muted-foreground">
            {t("rubricSet.filterCount", { shown: visible.length, total: inTab.length })}
          </span>
        </div>
      )}

      {inTab.length > 0 && visible.length === 0 && (
        <EmptyState icon={Layers} title={t("rubricSet.filterEmpty")} className="min-h-32 border-none p-4" />
      )}

      {visible.map((tpl) => (
        <Card key={tpl.id}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {renamingId === tpl.id ? (
                  <span className="flex items-center gap-1">
                    <Input
                      autoFocus
                      className="h-8 w-80 text-sm"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitRename(tpl.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                    />
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={t("common.save")}
                      disabled={updateMutation.isPending}
                      onClick={() => submitRename(tpl.id)}
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={t("common.cancel")}
                      onClick={() => setRenamingId(null)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </span>
                ) : (
                  <span className="group/name flex items-center gap-1">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
                      onClick={() => setOpenCriteriaId(openCriteriaId === tpl.id ? null : tpl.id)}
                    >
                      {openCriteriaId === tpl.id ? (
                        <ChevronDown className="size-4 shrink-0" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0" />
                      )}
                      {tpl.name}
                    </button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={t("rubricSet.rename")}
                      title={t("rubricSet.rename")}
                      onClick={() => {
                        setRenamingId(tpl.id);
                        setNameDraft(tpl.name);
                      }}
                    >
                      <Pencil className="size-3.5 text-muted-foreground" />
                    </Button>
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {t(isAcceptanceSet(tpl) ? "rubricSet.contentCount" : "rubricSet.criteriaCount", {
                    n: tpl.criteria.filter((c) => c.isActive).length,
                  })}
                </span>
                {/* Xét duyệt: QĐ543 BM03 ghi "Cộng 100" — bộ chưa cộng đủ thì BE không cho đem chấm,
                    hiện thẳng con số ra đây. Nghiệm thu: BM10 chấm mức 1–5, không có tổng để khớp. */}
                {isAcceptanceSet(tpl) ? (
                  <Badge variant="outline">{t("rubricSet.levelScale")}</Badge>
                ) : (
                  <span
                    className={
                      tpl.isTotalValid ? "text-xs font-medium text-success" : "text-xs font-medium text-destructive"
                    }
                  >
                    {t("rubricSet.totalScore", { total: tpl.totalCriteriaScore, max: tpl.maxTotalScore })}
                    {!tpl.isTotalValid && ` — ${t("rubricSet.totalInvalid")}`}
                  </span>
                )}
                {tpl.isLocked && (
                  <Badge variant="secondary" className="gap-1" title={t("rubricSet.lockedHint")}>
                    <Lock className="size-3" />
                    {t("rubricSet.locked", { n: tpl.ballotCount ?? 0 })}
                  </Badge>
                )}
                {tpl.scopes.length > 0 && (
                  <Badge variant="outline">{t("rubricSet.scopeCount", { n: tpl.scopes.length })}</Badge>
                )}
                {/* Bộ đã tắt vẫn nằm trong danh sách — không đánh dấu thì nhìn y hệt bộ đang dùng. */}
                {!tpl.isActive && <Badge variant="secondary">{t("rubricSet.inactive")}</Badge>}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs"
                  disabled={duplicateMutation.isPending}
                  onClick={() => duplicateMutation.mutate(tpl.id)}
                >
                  <Copy className="size-3.5" />
                  {t("rubricSet.duplicate")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}
                >
                  {expandedId === tpl.id ? t("common.close") : t("rubricSet.configure")}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={t("rubricSet.deleteSet")}
                  title={tpl.isLocked ? t("rubricSet.lockedHint") : t("rubricSet.deleteSet")}
                  disabled={deleteTemplateMutation.isPending || tpl.isLocked}
                  onClick={() => deleteTemplateMutation.mutate(tpl.id)}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>

            {/* Loại đề tài áp dụng — rào chắn khi gắn vào đợt (đợt đã gắn chặt 1 loại). */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-medium text-muted-foreground">{t("rubricSet.appliesTo")}</span>
              {(["appliesBasic", "appliesApplied"] as const).map((field) => (
                <label key={field} className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-[var(--color-primary)]"
                    disabled={tpl.isLocked}
                    checked={tpl[field]}
                    onChange={(e) => updateMutation.mutate({ id: tpl.id, payload: { [field]: e.target.checked } })}
                  />
                  {field === "appliesBasic" ? t("rubricSet.basic") : t("rubricSet.applied")}
                </label>
              ))}
            </div>

            {/* Tiêu chí sửa NGAY TRONG bộ — trước đây phải mò xuống bảng phẳng bên dưới,
                mà bảng đó lại gom theo LOẠI VÒNG nên không biết sửa của bộ nào.
                Thu gọn được vì nhiều bộ × nhiều tiêu chí là trang dài lê thê. */}
            {openCriteriaId === tpl.id && <CriteriaEditor template={tpl} />}

            {expandedId === tpl.id && <ScopeEditor template={tpl} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Thêm / sửa / xoá tiêu chí ngay trong bộ.
 * Điểm mấu chốt: gọi `/rubric-templates/{id}/criteria` nên tiêu chí vào ĐÚNG bộ này —
 * endpoint cũ `/rubric-criteria` tìm bộ bằng loại vòng nên luôn rơi vào bộ đầu tiên.
 */
function CriteriaEditor({ template }: { template: RubricTemplateFull }) {
  const { t } = useTranslation();
  const saveMutation = useSaveTemplateCriterionMutation();
  const deleteMutation = useDeleteTemplateCriterionMutation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<{ criterionName: string; maxScore: string }>({ criterionName: "", maxScore: "" });
  const [adding, setAdding] = useState(false);

  const acceptance = isAcceptanceSet(template);
  const locked = Boolean(template.isLocked);
  const total = template.criteria.filter((c) => c.isActive).reduce((s, c) => s + Number(c.maxScore), 0);

  const submit = (criterionId?: number) => {
    const name = draft.criterionName.trim();
    // Nghiệm thu: không nhập điểm — BE tự đặt trần = mức 5 (Biểu mẫu 10).
    const score = acceptance ? 5 : Number(draft.maxScore);
    if (!name || !score || score <= 0) return;
    saveMutation.mutate(
      { templateId: template.id, criterionId, payload: { criterionName: name, maxScore: score } },
      {
        onSuccess: () => {
          setEditingId(null);
          setAdding(false);
          setDraft({ criterionName: "", maxScore: "" });
        },
      },
    );
  };

  const editorRow = (criterionId?: number) => (
    <li className="flex flex-wrap items-center gap-2 px-3 py-2">
      <Input
        autoFocus
        className="h-8 min-w-40 flex-1 text-xs"
        placeholder={t(acceptance ? "rubricSet.contentName" : "rubricSet.criterionName")}
        value={draft.criterionName}
        onChange={(e) => setDraft((d) => ({ ...d, criterionName: e.target.value }))}
        onKeyDown={(e) => e.key === "Enter" && submit(criterionId)}
      />
      {acceptance ? (
        <span className="text-xs text-muted-foreground">{t("rubricSet.levelShort")}</span>
      ) : (
        <Input
          type="number"
          min={1}
          className="h-8 w-20 text-xs"
          placeholder={t("rubricSet.maxScore")}
          value={draft.maxScore}
          onChange={(e) => setDraft((d) => ({ ...d, maxScore: e.target.value }))}
        />
      )}
      <Button size="sm" className="h-8 text-xs" disabled={saveMutation.isPending} onClick={() => submit(criterionId)}>
        {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
        {t("common.save")}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 text-xs"
        onClick={() => {
          setEditingId(null);
          setAdding(false);
        }}
      >
        {t("common.cancel")}
      </Button>
    </li>
  );

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {locked && <li className="bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{t("rubricSet.lockedHint")}</li>}
      {template.criteria.length === 0 && !adding && (
        <li className="px-3 py-2 text-xs text-warning">{t("rubricSet.noCriteria")}</li>
      )}

      {template.criteria.map((c, i) =>
        editingId === c.id ? (
          <div key={c.id}>{editorRow(c.id)}</div>
        ) : (
          <li key={c.id} className="group flex items-center justify-between gap-3 px-3 py-2 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {i + 1}
              </span>
              <span className={cn("truncate text-foreground", !c.isActive && "line-through opacity-60")}>
                {c.criterionName}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {/* Bộ nghiệm thu cũ (4 × 25) vẫn chấm theo mức — đừng hiện "25đ" gây hiểu nhầm. */}
              <span className="tabular-nums text-muted-foreground">
                {acceptance ? t("rubricSet.levelShort") : `${c.maxScore}đ`}
              </span>
              {!locked && (
                <>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("common.edit")}
                    onClick={() => {
                      setEditingId(c.id);
                      setAdding(false);
                      setDraft({ criterionName: c.criterionName, maxScore: String(c.maxScore) });
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  {/* Tiêu chí đã có điểm chấm thì BE chỉ tắt chứ không xoá (giữ lịch sử);
                  phải có đường bật lại, không thì coi như mất hẳn. */}
                  {c.isActive ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={t("common.delete")}
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate({ templateId: template.id, criterionId: c.id })}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      disabled={saveMutation.isPending}
                      onClick={() =>
                        saveMutation.mutate({
                          templateId: template.id,
                          criterionId: c.id,
                          payload: { criterionName: c.criterionName, maxScore: c.maxScore, isActive: true },
                        })
                      }
                    >
                      {t("rubricSet.restore")}
                    </Button>
                  )}
                </>
              )}
            </span>
          </li>
        ),
      )}

      {adding && editorRow()}

      <li className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium">
        {locked ? (
          <span />
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
              setDraft({ criterionName: "", maxScore: "" });
            }}
          >
            <Plus className="size-3.5" />
            {t(acceptance ? "rubricSet.addContent" : "rubricSet.addCriterion")}
          </Button>
        )}
        {acceptance ? (
          <span className="text-muted-foreground">{t("rubricSet.levelLegend")}</span>
        ) : (
          <span className="text-muted-foreground">
            {t("rubricSet.total")}: <span className="tabular-nums text-foreground">{total}đ</span>
          </span>
        )}
      </li>
    </ul>
  );
}

/** Tick lĩnh vực trong từng đợt để bộ này khả dụng ở đó. */
function ScopeEditor({ template }: { template: RubricTemplateFull }) {
  const { t } = useTranslation();
  const { data: cycles } = useCyclesQuery();
  const saveMutation = useSaveRubricScopesMutation();

  const [selected, setSelected] = useState<{ cycleId: number; trackId: number }[]>(
    template.scopes.map((s) => ({ cycleId: s.cycleId, trackId: s.trackId })),
  );

  const isOn = (cycleId: number, trackId: number) =>
    selected.some((s) => s.cycleId === cycleId && s.trackId === trackId);

  const toggle = (cycleId: number, trackId: number) =>
    setSelected((prev) =>
      isOn(cycleId, trackId)
        ? prev.filter((s) => !(s.cycleId === cycleId && s.trackId === trackId))
        : [...prev, { cycleId, trackId }],
    );

  // Chỉ hiện đợt đúng loại mà bộ này áp dụng (rào chắn tránh gắn nhầm).
  const eligible = (cycles ?? []).filter((c) => {
    const isApplied = Boolean((c as { requireOrderingUnit?: boolean }).requireOrderingUnit);
    return isApplied ? template.appliesApplied : template.appliesBasic;
  });

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{t("rubricSet.scopeHint")}</p>

      {eligible.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("rubricSet.noEligibleCycle")}</p>
      ) : (
        eligible.map((c) => (
          <CycleTrackPicker key={c.id} cycleId={Number(c.id)} cycleName={c.name} isOn={isOn} toggle={toggle} />
        ))
      )}

      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate({ id: template.id, payload: { entries: selected } })}
        >
          {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}

function CycleTrackPicker({
  cycleId,
  cycleName,
  isOn,
  toggle,
}: {
  cycleId: number;
  cycleName: string;
  isOn: (cycleId: number, trackId: number) => boolean;
  toggle: (cycleId: number, trackId: number) => void;
}) {
  const { data: tracks } = useTracksByCycleQuery(cycleId);
  if (!tracks || tracks.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-foreground">{cycleName}</p>
      <div className="flex flex-wrap gap-3">
        {tracks.map((tr) => (
          <label key={tr.id} className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              className="size-3.5 accent-[var(--color-primary)]"
              checked={isOn(cycleId, Number(tr.id))}
              onChange={() => toggle(cycleId, Number(tr.id))}
            />
            {tr.name}
          </label>
        ))}
      </div>
    </div>
  );
}
