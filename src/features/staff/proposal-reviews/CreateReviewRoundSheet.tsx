import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FormSheet } from "@/components/shared/FormSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateReviewRoundMutation } from "@/hooks/useReviewRounds";
import { REVIEW_ROUND_TYPE, ROUND_DIMENSION } from "@/constants/statuses";
import type { ReviewRound } from "@/types/review-round";

const NONE_VALUE = "none";

/** Staff only creates Review and Final (acceptance) rounds — Screening isn't offered here. */
const CREATABLE_ROUND_TYPES = [REVIEW_ROUND_TYPE.REVIEW, REVIEW_ROUND_TYPE.ACCEPTANCE];
const ROUND_TYPE_LABELS: Record<string, string> = {
  [REVIEW_ROUND_TYPE.REVIEW]: "Review",
  [REVIEW_ROUND_TYPE.ACCEPTANCE]: "Final",
};

const schema = z.object({
  dimension: z.enum([ROUND_DIMENSION.SCIENCE, ROUND_DIMENSION.FINANCE], {
    message: "Select a dimension",
  }),
  roundType: z.string().min(1, "Select a round type"),
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
  const createMutation = useCreateReviewRoundMutation(proposalId);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dimension: undefined, roundType: REVIEW_ROUND_TYPE.REVIEW, prerequisiteRoundId: undefined },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        dimension: values.dimension,
        roundType: values.roundType,
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
      title="Create Review Round"
      description="Add a new review round for this proposal."
      formId="review-round-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createMutation.isPending}
      submitLabel="Create round"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Round type</label>
        <Controller
          control={control}
          name="roundType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select round type" />
              </SelectTrigger>
              <SelectContent>
                {CREATABLE_ROUND_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ROUND_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.roundType && <p className="mt-1 text-xs text-destructive">{errors.roundType.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Dimension</label>
        <Controller
          control={control}
          name="dimension"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={Boolean(errors.dimension)}>
                <SelectValue placeholder="Select dimension" />
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
          <label className="mb-1.5 block text-sm font-medium text-foreground">Prerequisite round</label>
          <Controller
            control={control}
            name="prerequisiteRoundId"
            render={({ field }) => (
              <Select value={field.value ?? NONE_VALUE} onValueChange={(value) => field.onChange(value === NONE_VALUE ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
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
    </FormSheet>
  );
}
