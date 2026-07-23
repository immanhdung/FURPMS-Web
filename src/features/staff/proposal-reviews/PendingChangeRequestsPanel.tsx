import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FormSheet } from "@/components/shared/FormSheet";
import { Textarea } from "@/components/ui/textarea";
import { usePendingChangeRequestsQuery, useReviewChangeRequestMutation } from "@/hooks/useChangeRequests";
import { formatDateTime } from "@/utils/format";
import { CHANGE_REQUEST_TYPE_LABELS, type ChangeRequest } from "@/types/change-request";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";

const reviewSchema = z.object({ adminNote: z.string().optional() });
type ReviewForm = z.infer<typeof reviewSchema>;

interface ReviewSheetProps {
  cr: ChangeRequest | null;
  decision: "approve" | "reject" | null;
  onClose: () => void;
}

function ReviewSheet({ cr, decision, onClose }: ReviewSheetProps) {
  const { t } = useTranslation();
  const mutation = useReviewChangeRequestMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewForm>({ resolver: zodResolver(reviewSchema) });

  if (!cr || !decision) return null;

  const onSubmit = (values: ReviewForm) => {
    mutation.mutate(
      { id: cr.id, payload: { approved: decision === "approve", adminNote: values.adminNote || undefined } },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  const isApprove = decision === "approve";

  return (
    <FormSheet
      open={Boolean(cr && decision)}
      onOpenChange={(open) => !open && onClose()}
      title={isApprove ? t("changeRequest.approveTitle") : t("changeRequest.rejectTitle")}
      description={t("changeRequest.reviewDesc")}
      formId="review-change-request-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={mutation.isPending}
      submitLabel={isApprove ? t("common.approve") : t("common.reject")}
      submitVariant={isApprove ? "default" : "destructive"}
    >
      <div className="rounded-lg bg-muted/40 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{CHANGE_REQUEST_TYPE_LABELS[cr.type]}</span>
          <Badge variant="secondary">Pending</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{cr.description}</p>
        {cr.newValue && (
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium">{t("changeRequest.newValue")}:</span> {cr.newValue}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="adminNote" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("changeRequest.adminNote")} <span className="text-muted-foreground">({t("changeRequest.optional")})</span>
        </label>
        <Textarea
          id="adminNote"
          rows={4}
          placeholder={t("changeRequest.adminNotePlaceholder")}
          {...register("adminNote")}
        />
      </div>
    </FormSheet>
  );
}

export function PendingChangeRequestsPanel() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = usePendingChangeRequestsQuery();
  const [selected, setSelected] = useState<ChangeRequest | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);

  const openReview = (cr: ChangeRequest, d: "approve" | "reject") => {
    setSelected(cr);
    setDecision(d);
  };
  const closeReview = () => {
    setSelected(null);
    setDecision(null);
  };

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("changeRequest.staffTitle")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("changeRequest.staffSubtitle")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t("changeRequest.noPending")}
          description={t("changeRequest.noPendingDesc")}
          icon={<Clock className="size-8 text-muted-foreground" />}
        />
      ) : (
        <ul className="space-y-3">
          {data.map((cr) => (
            <li
              key={cr.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{CHANGE_REQUEST_TYPE_LABELS[cr.type]}</Badge>
                  <Badge variant="secondary">
                    <Clock className="mr-1 size-3" />
                    {t("changeRequest.pendingBadge")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-foreground">{cr.description}</p>
                {cr.newValue && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium">{t("changeRequest.newValue")}:</span> {cr.newValue}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">{formatDateTime(cr.createdAt)}</p>
              </div>

              <div className="flex gap-2 sm:shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => openReview(cr, "approve")}
                >
                  <CheckCircle className="size-3.5 text-green-500" />
                  {t("common.approve")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => openReview(cr, "reject")}
                >
                  <XCircle className="size-3.5 text-destructive" />
                  {t("common.reject")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ReviewSheet cr={selected} decision={decision} onClose={closeReview} />
    </div>
  );
}
