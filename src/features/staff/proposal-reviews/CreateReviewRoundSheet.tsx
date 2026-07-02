import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateReviewRoundMutation } from "@/hooks/useReviewRounds";
import { REVIEW_ROUND_TYPE } from "@/constants/statuses";
import type { ReviewRound } from "@/types/review-round";

const NONE_VALUE = "none";

const schema = z.object({
  dimension: z.string().optional(),
  roundType: z.string().min(1, "Select a round type"),
  prerequisiteRoundId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateReviewRoundSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string;
  existingRounds: ReviewRound[];
}

export function CreateReviewRoundSheet({ open, onOpenChange, proposalId, existingRounds }: CreateReviewRoundSheetProps) {
  const createMutation = useCreateReviewRoundMutation(proposalId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dimension: "", roundType: REVIEW_ROUND_TYPE.SCREENING, prerequisiteRoundId: undefined },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        dimension: values.dimension || undefined,
        roundType: values.roundType,
        prerequisiteRoundId: values.prerequisiteRoundId,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
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
                {Object.values(REVIEW_ROUND_TYPE).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.roundType && <p className="mt-1 text-xs text-destructive">{errors.roundType.message}</p>}
      </div>

      <div>
        <label htmlFor="round-dimension" className="mb-1.5 block text-sm font-medium text-foreground">
          Dimension
        </label>
        <Input id="round-dimension" placeholder="e.g. Scientific, Financial" {...register("dimension")} />
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
