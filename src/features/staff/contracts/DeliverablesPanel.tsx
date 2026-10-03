import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleCheck, CircleX, ClipboardCheck, Package, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DeadlineBadge } from "@/components/shared/DeadlineBadge";
import { DeliverableFiles } from "@/components/shared/DeliverableFiles";
import {
  useCreateDeliverableMutation,
  useDeleteDeliverableMutation,
  useDeliverablesQuery,
  useUpdateDeliverableMutation,
} from "@/hooks/useDeliverables";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { SubmitDeliverableDialog } from "@/features/staff/contracts/SubmitDeliverableDialog";
import { EvaluateDeliverableDialog } from "@/features/staff/contracts/EvaluateDeliverableDialog";
import { ACCEPTANCE_STATUS, type Deliverable } from "@/types/deliverable";
import { formatDate, formatDateTime } from "@/utils/format";

import { DeliverableDetailSheet } from "@/components/shared/DossierDetailSheet";
/**
 * Sản phẩm phải nộp của hợp đồng.
 * PI nộp file → Staff nghiệm thu. Nghiệm thu ĐẠT sẽ mở điều kiện chi tiền cho đợt giải ngân tương ứng.
 */
/**
 * Sản phẩm của hợp đồng.
 *
 * `canSubmit` mặc định FALSE: người NỘP sản phẩm là **PI** (trang /deliverables),
 * Staff chỉ **thêm sản phẩm phải giao + nghiệm thu**. Panel này nhúng trong màn Hợp đồng
 * của Staff mà vẫn hiện nút "Nộp lại" ⇒ Staff nộp hộ PI — lỗi sai vai thứ BA cùng kiểu
 * (sau báo cáo tổng kết và yêu cầu điều chỉnh).
 */
export function DeliverablesPanel({
  contractId,
  canManage,
  canSubmit = false,
}: {
  contractId: string;
  canManage: boolean;
  canSubmit?: boolean;
}) {
  const [openDeliverable, setOpenDeliverable] = useState<Deliverable | null>(null);
  const { t } = useTranslation();
  const { data: deliverables, isLoading } = useDeliverablesQuery(contractId);
  const [submitting, setSubmitting] = useState<Deliverable | null>(null);
  const [evaluating, setEvaluating] = useState<Deliverable | null>(null);
  const createMutation = useCreateDeliverableMutation(contractId);
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [dueDate, setDueDate] = useState("");
  // Sửa tại chỗ (tên + hạn) và xoá. Trước 03/10 sản phẩm tạo xong là không sửa/xoá được trên giao
  // diện dù BE đã có API — tạo sai tên là phải để nguyên.
  const updateMutation = useUpdateDeliverableMutation(contractId);
  const deleteMutation = useDeleteDeliverableMutation(contractId);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDue, setEditDue] = useState("");
  const [deleting, setDeleting] = useState<Deliverable | null>(null);
  const saveEdit = (d: Deliverable) => {
    if (!editName.trim()) return;
    updateMutation.mutate(
      {
        id: d.id,
        payload: {
          productName: editName.trim(),
          dueDate: editDue || undefined,
          description: d.description ?? undefined,
        },
      },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const submitAdd = () => {
    if (!productName.trim()) return;
    createMutation.mutate(
      { productName: productName.trim(), dueDate: dueDate || undefined },
      {
        onSuccess: () => {
          setProductName("");
          setDueDate("");
          setShowForm(false);
        },
      },
    );
  };

  const passedCount = (deliverables ?? []).filter((d) => d.acceptanceStatus === ACCEPTANCE_STATUS.PASSED).length;

  return (
    <div className="space-y-3">
      {/* Staff định nghĩa sản phẩm phải nộp — đề cương không có trường sản phẩm cấu trúc nên nhập tay. */}
      {canManage &&
        (!showForm ? (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <Plus />
              {t("contract.deliverable.add")}
            </Button>
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <Input
              placeholder={t("contract.deliverable.productName")}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Input type="date" className="w-44" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <span className="text-xs text-muted-foreground">{t("contract.deliverable.dueOptional")}</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                {t("common.cancel")}
              </Button>
              <Button size="sm" disabled={!productName.trim() || createMutation.isPending} onClick={submitAdd}>
                {t("contract.deliverable.add")}
              </Button>
            </div>
          </div>
        ))}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !deliverables || deliverables.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t("contract.deliverable.none")}
          description={t("contract.deliverable.noneDesc")}
          className="min-h-32 border-none p-4"
        />
      ) : (
        <>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{passedCount}</span> {t("contract.disbursement.of")}{" "}
            <span className="font-medium text-foreground">{deliverables.length}</span>{" "}
            {t("contract.deliverable.accepted")}
          </div>

          {deliverables.map((d) => {
            const isSubmitted = Boolean(d.submittedAt);
            const isPassed = d.acceptanceStatus === ACCEPTANCE_STATUS.PASSED;
            const isFailed = d.acceptanceStatus === ACCEPTANCE_STATUS.FAILED;

            return (
              <div key={d.id} className="space-y-2 rounded-lg border border-border p-3">
                {editingId === d.id ? (
                  <div className="space-y-2">
                    <Input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="date"
                        className="w-44"
                        value={editDue}
                        onChange={(e) => setEditDue(e.target.value)}
                      />
                      <span className="text-xs text-muted-foreground">{t("contract.deliverable.dueOptional")}</span>
                      <div className="ml-auto flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          {t("common.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          disabled={!editName.trim() || updateMutation.isPending}
                          onClick={() => saveEdit(d)}
                        >
                          {t("common.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => setOpenDeliverable(d)}
                        className="text-left text-sm font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {d.productName}
                      </button>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {d.categoryName && <span>{d.categoryName} · </span>}
                        {d.dueDate
                          ? t("contract.deliverable.due", { date: formatDate(d.dueDate) })
                          : t("contract.deliverable.noDueDate")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Sản phẩm CHƯA nghiệm thu Đạt thì hạn còn ý nghĩa — nghiệm thu rồi thì thôi.
                    Trước 25/08 chỗ này chỉ in ngày, nên hạn đã qua nhìn y hệt hạn còn xa. */}
                      {d.dueDate && d.acceptanceStatus !== "PASSED" && (
                        <DeadlineBadge deadline={d.dueDate} daysLeft={d.daysLeft} />
                      )}
                      {d.acceptanceStatus && <StatusBadge status={d.acceptanceStatus} />}
                      {/* Đạt rồi thì khoá (BE cũng chặn) — muốn sửa thì "Sửa đánh giá" sang Không đạt trước. */}
                      {canManage && !isPassed && (
                        <>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("common.edit")}
                            title={t("common.edit")}
                            onClick={() => {
                              setEditingId(d.id);
                              setEditName(d.productName);
                              setEditDue(d.dueDate ? d.dueDate.slice(0, 10) : "");
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("common.delete")}
                            title={t("common.delete")}
                            onClick={() => setDeleting(d)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}

                {isSubmitted && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{t("contract.deliverable.submitted", { date: formatDateTime(d.submittedAt) })}</span>
                  </div>
                )}

                {/* File/link thật PI đã nộp. Trước đây chỗ này chỉ render đúng `fileUrl` thành thẻ <a>:
                file upload thì cần token nên bấm ra 401, link thiếu "https://" thì bấm đi lạc, còn
                file đã upload + minh chứng thử nghiệm KHÔNG hề được liệt kê ⇒ Staff nghiệm thu
                mà không thấy sản phẩm nào. */}
                <DeliverableFiles deliverable={d} />

                {d.qualityAssessment && (
                  <p
                    className={`text-xs ${isPassed ? "text-success" : isFailed ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {isPassed && <CircleCheck className="mr-1 inline size-3" />}
                    {isFailed && <CircleX className="mr-1 inline size-3" />}
                    {d.qualityAssessment}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {/* PI nộp/nộp lại — BE cho phép nộp lại khi bị đánh trượt.
                  Staff KHÔNG nộp hộ: panel này nhúng ở màn Staff nên phải gác bằng canSubmit. */}
                  {canSubmit && !isPassed && (
                    <Button size="sm" variant="outline" onClick={() => setSubmitting(d)}>
                      <Upload />
                      {isSubmitted ? t("contract.deliverable.resubmit") : t("contract.deliverable.submit")}
                    </Button>
                  )}
                  {/*
                Trước 17/08 nút này BIẾN MẤT khi sản phẩm đã Đạt, nên chuyên viên chấm nhầm là kẹt:
                không xem lại được nhận xét mình đã ghi, cũng không sửa được. Mà máy chủ **không hề
                chặn** — `DeliverableService.EvaluateAsync` cho ghi đè kết quả bất kỳ lúc nào. Đây
                là khoá do giao diện tự đặt ra, không có quy định nào đứng sau: QĐ543 chỉ khoá BIÊN
                BẢN hội đồng sau khi Chủ tịch chốt (rule #12), không khoá kết quả từng sản phẩm.
              */}
                  {canManage && isSubmitted && (
                    <Button size="sm" variant={isPassed ? "outline" : "default"} onClick={() => setEvaluating(d)}>
                      <ClipboardCheck />
                      {isPassed || isFailed
                        ? t("contract.deliverable.editEvaluation")
                        : t("contract.deliverable.evaluate")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      <SubmitDeliverableDialog
        open={Boolean(submitting)}
        onOpenChange={(open) => !open && setSubmitting(null)}
        contractId={contractId}
        deliverable={submitting}
      />
      <EvaluateDeliverableDialog
        open={Boolean(evaluating)}
        onOpenChange={(open) => !open && setEvaluating(null)}
        contractId={contractId}
        deliverable={evaluating}
      />
      {/* Chưa nộp: xác nhận thường. Đã nộp minh chứng: bắt ghi lý do (vào sổ quyết định). */}
      <ConfirmDialog
        open={Boolean(deleting) && !deleting?.submittedAt}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("contract.deliverable.deleteTitle")}
        description={t("contract.deliverable.deleteDescription", { name: deleting?.productName ?? "" })}
        confirmLabel={t("common.delete")}
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate({ id: deleting.id }, { onSuccess: () => setDeleting(null) })}
      />
      <ReasonDialog
        open={Boolean(deleting?.submittedAt)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("contract.deliverable.deleteTitle")}
        description={t("contract.deliverable.deleteSubmittedDescription", { name: deleting?.productName ?? "" })}
        confirmLabel={t("common.delete")}
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={(reason) =>
          deleting && deleteMutation.mutate({ id: deleting.id, reason }, { onSuccess: () => setDeleting(null) })
        }
      />
      <DeliverableDetailSheet
        item={openDeliverable}
        open={Boolean(openDeliverable)}
        onOpenChange={(o) => !o && setOpenDeliverable(null)}
      />
    </div>
  );
}
