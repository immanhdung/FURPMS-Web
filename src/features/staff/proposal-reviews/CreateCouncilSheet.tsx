import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { useCreateCouncilMutation } from "@/hooks/useCouncils";
import type { ReviewRound } from "@/types/review-round";

const schema = z.object({
  councilType: z.string().min(1, "Council type is required"),
  establishmentDecisionNo: z.string().optional(),
  establishedAt: z.string().optional(),
  meetingDeadline: z.string().optional(),
  minMembersRequired: z.number().min(1, "Must be at least 1"),
  maxMembersAllowed: z.number().min(1, "Must be at least 1"),
});

type FormValues = z.infer<typeof schema>;

interface CreateCouncilSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string;
  round: ReviewRound;
}

export function CreateCouncilSheet({ open, onOpenChange, proposalId, round }: CreateCouncilSheetProps) {
  const createMutation = useCreateCouncilMutation(proposalId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      councilType: "",
      establishmentDecisionNo: "",
      establishedAt: "",
      meetingDeadline: "",
      minMembersRequired: 4,
      maxMembersAllowed: 4,
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        proposalId,
        roundId: round.id,
        councilType: values.councilType,
        establishmentDecisionNo: values.establishmentDecisionNo || undefined,
        establishedAt: values.establishedAt || undefined,
        meetingDeadline: values.meetingDeadline || undefined,
        minMembersRequired: values.minMembersRequired,
        maxMembersAllowed: values.maxMembersAllowed,
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
      title="Establish Council"
      description={`Create a review council for Round ${round.roundNumber}.`}
      formId="create-council-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createMutation.isPending}
      submitLabel="Create council"
    >
      <div>
        <label htmlFor="council-type" className="mb-1.5 block text-sm font-medium text-foreground">
          Council type
        </label>
        <Input id="council-type" placeholder="e.g. Screening Council" aria-invalid={Boolean(errors.councilType)} {...register("councilType")} />
        {errors.councilType && <p className="mt-1 text-xs text-destructive">{errors.councilType.message}</p>}
      </div>

      <div>
        <label htmlFor="council-decision" className="mb-1.5 block text-sm font-medium text-foreground">
          Establishment decision no.
        </label>
        <Input id="council-decision" {...register("establishmentDecisionNo")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="council-established" className="mb-1.5 block text-sm font-medium text-foreground">
            Established date
          </label>
          <Input id="council-established" type="date" {...register("establishedAt")} />
        </div>
        <div>
          <label htmlFor="council-deadline" className="mb-1.5 block text-sm font-medium text-foreground">
            Meeting deadline
          </label>
          <Input id="council-deadline" type="date" {...register("meetingDeadline")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="council-min" className="mb-1.5 block text-sm font-medium text-foreground">
            Min. members
          </label>
          <Input id="council-min" type="number" aria-invalid={Boolean(errors.minMembersRequired)} {...register("minMembersRequired", { valueAsNumber: true })} />
          {errors.minMembersRequired && <p className="mt-1 text-xs text-destructive">{errors.minMembersRequired.message}</p>}
        </div>
        <div>
          <label htmlFor="council-max" className="mb-1.5 block text-sm font-medium text-foreground">
            Max. members
          </label>
          <Input id="council-max" type="number" aria-invalid={Boolean(errors.maxMembersAllowed)} {...register("maxMembersAllowed", { valueAsNumber: true })} />
          {errors.maxMembersAllowed && <p className="mt-1 text-xs text-destructive">{errors.maxMembersAllowed.message}</p>}
        </div>
      </div>
    </FormSheet>
  );
}
