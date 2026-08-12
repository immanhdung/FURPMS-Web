import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ACADEMIC_WORK_TYPES,
  WORK_CATEGORIES,
  WORK_FIELDS,
  WORK_ROLES,
  WORK_STATUSES,
  type AcademicWork,
  type AcademicWorkPayload,
  type AcademicWorkType,
} from "@/types/academic-work";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Có giá trị = đang sửa; không = đang thêm mới. */
  editing: AcademicWork | null;
  /** Mục được chọn sẵn khi bấm "Thêm" ngay trong một mục. */
  defaultType?: AcademicWorkType;
  isSaving: boolean;
  onSubmit: (payload: AcademicWorkPayload) => void;
}

const EMPTY: AcademicWorkPayload = {
  workType: "PUBLICATION",
  category: "ISI_SCOPUS",
  title: "",
  venue: null,
  authors: null,
  role: null,
  year: null,
  startYear: null,
  identifier: null,
  volume: null,
  pages: null,
  status: null,
  url: null,
  note: null,
  sortOrder: 0,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

/**
 * Khai một dòng của lý lịch khoa học (QĐ543 — BM02).
 *
 * Form **đổi theo mục đang chọn**: mục 14.6 mới hỏi volume/trang số, mục 17 mới hỏi tình trạng
 * nghiệm thu, mục 15 không hỏi tác giả. Hiện đủ mọi ô cho mọi mục thì người khai phải tự đoán ô
 * nào bỏ trống — mà đoán sai thì hồ sơ lệch biểu mẫu.
 */
export function AcademicWorkDialog({ open, onOpenChange, editing, defaultType, isSaving, onSubmit }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<AcademicWorkPayload>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const { id: _id, ...rest } = editing;
      setForm(rest);
    } else {
      const type = defaultType ?? "PUBLICATION";
      setForm({ ...EMPTY, workType: type, category: WORK_CATEGORIES[type][0] });
    }
  }, [open, editing, defaultType]);

  const shows = WORK_FIELDS[form.workType];
  const roles = WORK_ROLES[form.workType];

  const set = <K extends keyof AcademicWorkPayload>(key: K, value: AcademicWorkPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** Đổi mục thì phân loại cũ gần như chắc chắn không còn hợp lệ — nhảy về giá trị đầu của mục mới. */
  const changeType = (type: AcademicWorkType) =>
    setForm((prev) => ({ ...prev, workType: type, category: WORK_CATEGORIES[type][0], role: null, status: null }));

  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? t("academicWorks.editTitle") : t("academicWorks.createTitle")}</DialogTitle>
          <DialogDescription>{t(`academicWorks.typeHint.${form.workType}`)}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("academicWorks.field.workType")}>
              <Select value={form.workType} onValueChange={(v) => changeType(v as AcademicWorkType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_WORK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`academicWorks.type.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("academicWorks.field.category")}>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_CATEGORIES[form.workType].map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`academicWorks.category.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={t("academicWorks.field.title")}>
            <Input
              value={form.title}
              placeholder={t("academicWorks.placeholder.title")}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </Field>

          <Field label={t("academicWorks.field.venue")}>
            <Input
              value={form.venue ?? ""}
              placeholder={t("academicWorks.placeholder.venue")}
              onChange={(e) => set("venue", e.target.value || null)}
            />
          </Field>

          {shows.authors && (
            <Field label={t("academicWorks.field.authors")}>
              <Input
                value={form.authors ?? ""}
                placeholder={t("academicWorks.placeholder.authors")}
                onChange={(e) => set("authors", e.target.value || null)}
              />
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {shows.startYear && (
              <Field label={t("academicWorks.field.startYear")}>
                <Input
                  type="number"
                  value={form.startYear ?? ""}
                  onChange={(e) => set("startYear", num(e.target.value))}
                />
              </Field>
            )}
            <Field label={t("academicWorks.field.year")}>
              <Input type="number" value={form.year ?? ""} onChange={(e) => set("year", num(e.target.value))} />
            </Field>
            {shows.volume && (
              <Field label={t("academicWorks.field.volume")}>
                <Input
                  value={form.volume ?? ""}
                  placeholder={t("academicWorks.placeholder.volume")}
                  onChange={(e) => set("volume", e.target.value || null)}
                />
              </Field>
            )}
            {shows.pages && (
              <Field label={t("academicWorks.field.pages")}>
                <Input
                  value={form.pages ?? ""}
                  placeholder={t("academicWorks.placeholder.pages")}
                  onChange={(e) => set("pages", e.target.value || null)}
                />
              </Field>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {roles && (
              <Field label={t("academicWorks.field.role")}>
                <Select value={form.role ?? ""} onValueChange={(v) => set("role", v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("academicWorks.selectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`academicWorks.role.${r}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            {shows.status && (
              <Field label={t("academicWorks.field.status")}>
                <Select value={form.status ?? ""} onValueChange={(v) => set("status", v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("academicWorks.selectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`academicWorks.status.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("academicWorks.field.identifier")}>
              <Input
                value={form.identifier ?? ""}
                placeholder={t("academicWorks.placeholder.identifier")}
                onChange={(e) => set("identifier", e.target.value || null)}
              />
            </Field>
            <Field label={t("academicWorks.field.url")}>
              <Input
                type="url"
                value={form.url ?? ""}
                placeholder={t("academicWorks.placeholder.url")}
                onChange={(e) => set("url", e.target.value || null)}
              />
            </Field>
          </div>

          <Field label={t("academicWorks.field.note")}>
            <Textarea
              rows={2}
              value={form.note ?? ""}
              placeholder={t("academicWorks.placeholder.note")}
              onChange={(e) => set("note", e.target.value || null)}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSaving || !form.title.trim()}>
              {isSaving ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
