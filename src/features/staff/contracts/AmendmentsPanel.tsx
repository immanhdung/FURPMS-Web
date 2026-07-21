import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleCheck, CircleX, FilePenLine, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useAmendmentCategoriesQuery,
  useAmendmentsQuery,
  useApproveAmendmentMutation,
  useCreateAmendmentMutation,
  useRejectAmendmentMutation,
} from "@/hooks/useAmendments";
import { AMENDMENT_STATUS } from "@/types/amendment";
import { formatDateTime } from "@/utils/format";

/** Điều chỉnh hợp đồng: PI mô tả thay đổi + lý do → Staff duyệt hoặc từ chối. */
export function AmendmentsPanel({ contractId, canManage }: { contractId: string; canManage: boolean }) {
  const { t } = useTranslation();
  const { data: amendments, isLoading } = useAmendmentsQuery(contractId);
  const { data: categories } = useAmendmentCategoriesQuery();
  const createMutation = useCreateAmendmentMutation(contractId);
  const approveMutation = useApproveAmendmentMutation(contractId);
  const rejectMutation = useRejectAmendmentMutation(contractId);

  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [changeDescription, setChangeDescription] = useState("");
  const [justification, setJustification] = useState("");
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [comments, setComments] = useState<Record<string, string>>({});

  const resetForm = () => {
    setCategoryId("");
    setChangeDescription("");
    setJustification("");
    setOldValue("");
    setNewValue("");
    setShowForm(false);
  };

  const canCreate = categoryId && changeDescription.trim() && justification.trim() && !createMutation.isPending;

  return (
    <div className="space-y-3">
      {!showForm && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus />
            {t("contract.amendment.requestChange")}
          </Button>
        </div>
      )}

      {showForm && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium text-foreground">{t("contract.amendment.newRequest")}</p>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t("contract.amendment.type")} <span className="text-destructive">*</span>
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("contract.amendment.typePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="a-desc" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t("contract.amendment.whatChanges")} <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="a-desc"
                rows={2}
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="a-just" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t("contract.amendment.why")} <span className="text-destructive">*</span>
              </label>
              <Textarea id="a-just" rows={2} value={justification} onChange={(e) => setJustification(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="a-old" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {t("contract.amendment.from")}
                </label>
                <Input id="a-old" value={oldValue} onChange={(e) => setOldValue(e.target.value)} />
              </div>
              <div>
                <label htmlFor="a-new" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {t("contract.amendment.to")}
                </label>
                <Input id="a-new" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!canCreate}
                onClick={() =>
                  createMutation.mutate(
                    {
                      categoryId: Number(categoryId),
                      changeDescription: changeDescription.trim(),
                      justification: justification.trim(),
                      oldValue: oldValue.trim() || undefined,
                      newValue: newValue.trim() || undefined,
                      requiresRectorApproval: false,
                    },
                    { onSuccess: resetForm }
                  )
                }
              >
                {createMutation.isPending ? <Loader2 className="animate-spin" /> : <FilePenLine />}
                {t("contract.amendment.submitRequest")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-lg" />
      ) : !amendments || amendments.length === 0 ? (
        <EmptyState
          icon={FilePenLine}
          title={t("contract.amendment.none")}
          description={t("contract.amendment.noneDesc")}
          className="min-h-28 border-none p-4"
        />
      ) : (
        amendments.map((a) => {
          const isPending = a.status === AMENDMENT_STATUS.PENDING;
          return (
            <div key={a.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.categoryName ?? `Category ${a.categoryId}`}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t("contract.amendment.requestedAt", { date: formatDateTime(a.requestedAt) })}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <p className="text-sm text-foreground">{a.changeDescription}</p>
              <p className="text-xs text-muted-foreground">{a.justification}</p>

              {(a.oldValue || a.newValue) && (
                <p className="text-xs text-muted-foreground">
                  <span className="line-through">{a.oldValue || "—"}</span> → <span className="text-foreground">{a.newValue || "—"}</span>
                </p>
              )}

              {a.reviewerComments && <p className="text-xs text-muted-foreground">{t("contract.amendment.reviewer")} {a.reviewerComments}</p>}

              {canManage && isPending && (
                <div className="space-y-2 border-t border-border pt-2">
                  <Input
                    placeholder={t("contract.amendment.commentsPlaceholder")}
                    value={comments[a.id] ?? ""}
                    onChange={(e) => setComments((prev) => ({ ...prev, [a.id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate({ id: a.id, reviewerComments: comments[a.id] || undefined })}
                    >
                      <CircleCheck />
                      {t("common.approve")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate({ id: a.id, reviewerComments: comments[a.id] || undefined })}
                    >
                      <CircleX />
                      {t("common.reject")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
