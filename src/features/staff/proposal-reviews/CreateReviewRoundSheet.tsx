import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { FormSheet } from "@/components/shared/FormSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateReviewRoundMutation } from "@/hooks/useReviewRounds";
import { useDecisionQuery } from "@/hooks/useDecision";
import { PROPOSAL_STATUS, REVIEW_ROUND_TYPE, ROUND_DIMENSION, ROUND_TYPE_LABELS } from "@/constants/statuses";
import type { ReviewRound } from "@/types/review-round";
import type { ReviewRoundType } from "@/constants/statuses";

const NONE_VALUE = "none";

const schema = z.object({
  dimension: z.enum([ROUND_DIMENSION.SCIENCE, ROUND_DIMENSION.FINANCE], {
    message: "Select a dimension",
  }),
  prerequisiteRoundId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateReviewRoundSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string;
  existingRounds: ReviewRound[];
  onCreated?: (round: ReviewRound) => void;
}

export function CreateReviewRoundSheet({
  open,
  onOpenChange,
  proposalId,
  existingRounds,
  onCreated,
}: CreateReviewRoundSheetProps) {
  const { t } = useTranslation();
  const createMutation = useCreateReviewRoundMutation(proposalId);

  /**
   * A proposal only ever gets one Review round, then — once the chairman approves that round's
   * decision — exactly one Final (acceptance) round for final acceptance. Round type is no longer
   * a free choice; it's determined by where the proposal is in that sequence.
   */
  const normalizeType = (type?: string | null) => type?.toUpperCase();
  const reviewRound = existingRounds.find((r) => normalizeType(r.roundType) === REVIEW_ROUND_TYPE.REVIEW);
  const finalRound = existingRounds.find((r) => normalizeType(r.roundType) === REVIEW_ROUND_TYPE.ACCEPTANCE);

  const { data: reviewDecision, isLoading: isDecisionLoading } = useDecisionQuery(reviewRound?.councilId ?? null);
  const isReviewApproved = reviewDecision?.result?.toUpperCase() === PROPOSAL_STATUS.APPROVED;

  let nextRoundType: ReviewRoundType | null = null;
  let blockedReason: string | null = null;

  if (!reviewRound) {
    nextRoundType = REVIEW_ROUND_TYPE.REVIEW;
  } else if (finalRound) {
    blockedReason = "This proposal already has both a review round and a final round.";
  } else if (isDecisionLoading) {
    blockedReason = null;
  } else if (isReviewApproved) {
    nextRoundType = REVIEW_ROUND_TYPE.ACCEPTANCE;
  } else {
    blockedReason = "The review round must be approved by the chairman before a final round can be created.";
  }

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dimension: undefined, prerequisiteRoundId: undefined },
  });

  const onSubmit = (values: FormValues) => {
    if (!nextRoundType) return;
    createMutation.mutate(
      {
        dimension: values.dimension,
        roundType: nextRoundType,
        prerequisiteRoundId: values.prerequisiteRoundId,
      },
      {
        onSuccess: (round) => {
          reset();
          onOpenChange(false);
          onCreated?.(round);
        },
      }
    );
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={nextRoundType ? `Create ${ROUND_TYPE_LABELS[nextRoundType]} Round` : t("reviewBoard.createRound")}
      description={t("reviewBoard.createRoundHint")}
      formId="review-round-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createMutation.isPending || isDecisionLoading || !nextRoundType}
      submitLabel={t("reviewBoard.createRoundBtn")}
    >
      {blockedReason ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
          {blockedReason}
        </p>
      ) : (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.roundType")}</label>
            <p className="text-sm text-foreground">
              {nextRoundType ? ROUND_TYPE_LABELS[nextRoundType] : "-"}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.dimension")}</label>
            <Controller
              control={control}
              name="dimension"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={Boolean(errors.dimension)}>
                    <SelectValue placeholder={t("reviewBoard.selectDimension")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ROUND_DIMENSION).map((dimension) => (
                      <SelectItem key={dimension} value={dimension}>
                        {dimension}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.dimension && <p className="mt-1 text-xs text-destructive">{errors.dimension.message}</p>}
          </div>

          {existingRounds.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">{t("reviewBoard.prerequisiteRound")}</label>
              <Controller
                control={control}
                name="prerequisiteRoundId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE_VALUE}
                    onValueChange={(value) => field.onChange(value === NONE_VALUE ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("reviewBoard.none")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>None</SelectItem>
                      {existingRounds.map((round) => (
                        <SelectItem key={round.id} value={round.id}>
                          Round {round.roundNumber} · {round.roundType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </>
      )}
    </FormSheet>
  );
}
