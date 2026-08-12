import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookMarked, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useAcademicWorksQuery,
  useCreateAcademicWorkMutation,
  useDeleteAcademicWorkMutation,
  useUpdateAcademicWorkMutation,
} from "@/hooks/useAcademicWorks";
import { AcademicWorkDialog } from "@/features/auth/pages/AcademicWorkDialog";
import { ACADEMIC_WORK_TYPES, WORK_ROLES, type AcademicWork, type AcademicWorkType } from "@/types/academic-work";

interface Props {
  userId: string;
  /** Người khác xem hồ sơ (Admin/Staff thẩm định) thì chỉ đọc — chỉ chính chủ mới khai được. */
  readOnly?: boolean;
}

/**
 * Danh sách công trình khoa học theo **QĐ543 — Biểu mẫu 02**.
 *
 * Thay cho 8 ô đếm số trước đây. Biểu mẫu đòi **cả hai**: số lượng (14.1–14.5) *và* danh sách
 * chi tiết (14.6, 16.3, 17, 19.4). Hệ thống cũ chỉ làm phần số ⇒ hồ sơ nộp lên thiếu so với
 * biểu mẫu, và con số tự khai thì hội đồng không tra được nguồn.
 *
 * Nay danh sách là nguồn sự thật, số do máy chủ cộng lại — hai phần không thể lệch nhau.
 */
export function AcademicWorksCard({ userId, readOnly = false }: Props) {
  const { t } = useTranslation();
  const { data: works, isLoading } = useAcademicWorksQuery(userId);

  const create = useCreateAcademicWorkMutation(userId);
  const update = useUpdateAcademicWorkMutation(userId);
  const remove = useDeleteAcademicWorkMutation(userId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicWork | null>(null);
  const [defaultType, setDefaultType] = useState<AcademicWorkType | undefined>();
  const [deleting, setDeleting] = useState<AcademicWork | null>(null);

  /** Gom theo mục của biểu mẫu, giữ đúng thứ tự BM02 để đối chiếu hồ sơ cho dễ. */
  const grouped = useMemo(() => {
    const map = new Map<AcademicWorkType, AcademicWork[]>();
    for (const type of ACADEMIC_WORK_TYPES) {
      const rows = (works ?? []).filter((w) => w.workType === type);
      if (rows.length) map.set(type, rows);
    }
    return map;
  }, [works]);

  const openCreate = (type?: AcademicWorkType) => {
    setEditing(null);
    setDefaultType(type);
    setDialogOpen(true);
  };

  const openEdit = (work: AcademicWork) => {
    setEditing(work);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-border p-6">
        <Skeleton className="h-5 w-56" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const total = works?.length ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookMarked className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t("academicWorks.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("academicWorks.subtitle")}</p>
          </div>
        </div>
        {!readOnly && (
          <Button size="sm" onClick={() => openCreate()}>
            <Plus className="size-4" />
            {t("academicWorks.addBtn")}
          </Button>
        )}
      </div>

      {total === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-foreground">{t("academicWorks.empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("academicWorks.emptyHint")}</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {[...grouped.entries()].map(([type, rows]) => (
            <section key={type} className="p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(`academicWorks.type.${type}`)}
                  <span className="ml-2 font-normal normal-case">({rows.length})</span>
                </h3>
                {!readOnly && (
                  <Button size="sm" variant="ghost" onClick={() => openCreate(type)}>
                    <Plus className="size-3.5" />
                  </Button>
                )}
              </div>

              <ol className="space-y-2.5">
                {rows.map((work, index) => (
                  <li
                    key={work.id}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3"
                  >
                    <span className="mt-0.5 w-5 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                      {index + 1}.
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{work.title}</p>

                      {/* Dòng nguồn — đúng phần thầy bảo phải xem được, không chỉ đếm số. */}
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {[
                          work.venue,
                          work.volume && `Vol. ${work.volume}`,
                          work.pages && `tr. ${work.pages}`,
                          work.startYear && work.year
                            ? `${work.startYear}–${work.year}`
                            : (work.year ?? work.startYear)?.toString(),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>

                      {work.authors && <p className="mt-0.5 text-sm text-muted-foreground">{work.authors}</p>}

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline">{t(`academicWorks.category.${work.category}`)}</Badge>
                        {/*
                          Mục nào không hỏi vai trò thì cũng đừng hiện nhãn vai trò. Mục 17 là ví
                          dụ: phân loại đã là "Chủ trì"/"Tham gia" rồi, thêm nhãn vai trò nữa là
                          hai nhãn giống hệt nằm cạnh nhau. Bản ghi cũ có thể còn `role` sót lại
                          nên phải lọc lúc hiển thị, không chỉ lúc nhập.
                        */}
                        {work.role && WORK_ROLES[work.workType] && (
                          <Badge variant="secondary">{t(`academicWorks.role.${work.role}`)}</Badge>
                        )}
                        {work.status && <Badge variant="secondary">{t(`academicWorks.status.${work.status}`)}</Badge>}
                        {work.identifier && (
                          <span className="text-xs text-muted-foreground">{work.identifier}</span>
                        )}
                        {work.url && (
                          <a
                            href={work.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="size-3" />
                            {t("academicWorks.viewSource")}
                          </a>
                        )}
                      </div>

                      {work.note && <p className="mt-1.5 text-xs text-muted-foreground">{work.note}</p>}
                    </div>

                    {!readOnly && (
                      <div className="flex shrink-0 gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(work)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleting(work)}>
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {total > 0 && (
        <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          {t("academicWorks.countsElsewhere")}
        </p>
      )}

      <AcademicWorkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        defaultType={defaultType}
        isSaving={create.isPending || update.isPending}
        onSubmit={(payload) => {
          if (editing) {
            update.mutate({ workId: editing.id, payload }, { onSuccess: () => setDialogOpen(false) });
          } else {
            create.mutate(payload, { onSuccess: () => setDialogOpen(false) });
          }
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("academicWorks.deleteConfirm")}
        description={`"${deleting?.title ?? ""}" — ${t("academicWorks.deleteConfirmDesc")}`}
        variant="destructive"
        isLoading={remove.isPending}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
