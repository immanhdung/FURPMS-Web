import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateContractMutation } from "@/hooks/useContracts";
import { useProposalsQuery } from "@/hooks/useProposals";
import { PROPOSAL_STATUS } from "@/constants/statuses";
import { contractSchema, type ContractFormValues } from "@/features/staff/contracts/contract.schema";

interface CreateContractSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateContractSheet({ open, onOpenChange }: CreateContractSheetProps) {
  const { data: approvedProposals } = useProposalsQuery({ status: PROPOSAL_STATUS.APPROVED });
  const createMutation = useCreateContractMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      proposalId: "",
      contractNumber: "",
      scopeTitle: "",
      startDate: "",
      endDate: "",
      maxExtensionMonths: 0,
      sideARepresentative: "",
      econtractUrl: "",
    },
  });

  const onSubmit = (values: ContractFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create Contract"
      description="Set up a research contract for an approved proposal."
      formId="contract-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createMutation.isPending}
      submitLabel="Create contract"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Approved proposal</label>
        <Controller
          control={control}
          name="proposalId"
          render={({ field }) => (
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={Boolean(errors.proposalId)}>
                <SelectValue placeholder="Select an approved proposal" />
              </SelectTrigger>
              <SelectContent>
                {approvedProposals?.map((proposal) => (
                  <SelectItem key={proposal.id} value={proposal.id}>
                    {proposal.titleEN || proposal.titleVI || proposal.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.proposalId && <p className="mt-1 text-xs text-destructive">{errors.proposalId.message}</p>}
        {approvedProposals && approvedProposals.length === 0 && (
          <p className="mt-1 text-xs text-warning">No approved proposals are available yet.</p>
        )}
      </div>

      <div>
        <label htmlFor="contract-number" className="mb-1.5 block text-sm font-medium text-foreground">
          Contract number
        </label>
        <Input id="contract-number" {...register("contractNumber")} />
      </div>

      <div>
        <label htmlFor="contract-scope" className="mb-1.5 block text-sm font-medium text-foreground">
          Scope title
        </label>
        <Input id="contract-scope" {...register("scopeTitle")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="contract-start" className="mb-1.5 block text-sm font-medium text-foreground">
            Start date
          </label>
          <Input id="contract-start" type="date" aria-invalid={Boolean(errors.startDate)} {...register("startDate")} />
          {errors.startDate && <p className="mt-1 text-xs text-destructive">{errors.startDate.message}</p>}
        </div>
        <div>
          <label htmlFor="contract-end" className="mb-1.5 block text-sm font-medium text-foreground">
            End date
          </label>
          <Input id="contract-end" type="date" aria-invalid={Boolean(errors.endDate)} {...register("endDate")} />
          {errors.endDate && <p className="mt-1 text-xs text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contract-extension" className="mb-1.5 block text-sm font-medium text-foreground">
          Max extension (months)
        </label>
        <Input
          id="contract-extension"
          type="number"
          min={0}
          aria-invalid={Boolean(errors.maxExtensionMonths)}
          {...register("maxExtensionMonths", { valueAsNumber: true })}
        />
        {errors.maxExtensionMonths && (
          <p className="mt-1 text-xs text-destructive">{errors.maxExtensionMonths.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contract-representative" className="mb-1.5 block text-sm font-medium text-foreground">
          Side A representative
        </label>
        <Input id="contract-representative" {...register("sideARepresentative")} />
      </div>

      <div>
        <label htmlFor="contract-url" className="mb-1.5 block text-sm font-medium text-foreground">
          E-contract URL
        </label>
        <Input id="contract-url" {...register("econtractUrl")} />
      </div>
    </FormSheet>
  );
}
