import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";

export function Step3Details({ form }: { form: UseFormReturn<ProposalWizardValues> }) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="titleEN" className="mb-1.5 block text-sm font-medium text-foreground">
            Title (English)
          </label>
          <Input id="titleEN" aria-invalid={Boolean(errors.titleEN)} {...register("titleEN")} />
          {errors.titleEN && <p className="mt-1 text-xs text-destructive">{errors.titleEN.message}</p>}
        </div>
        <div>
          <label htmlFor="titleVI" className="mb-1.5 block text-sm font-medium text-foreground">
            Title (Vietnamese)
          </label>
          <Input id="titleVI" {...register("titleVI")} />
        </div>
      </div>

      <div>
        <label htmlFor="abstractEN" className="mb-1.5 block text-sm font-medium text-foreground">
          Abstract
        </label>
        <Textarea id="abstractEN" rows={4} aria-invalid={Boolean(errors.abstractEN)} {...register("abstractEN")} />
        {errors.abstractEN && <p className="mt-1 text-xs text-destructive">{errors.abstractEN.message}</p>}
      </div>

      <div>
        <label htmlFor="objectives" className="mb-1.5 block text-sm font-medium text-foreground">
          Objectives
        </label>
        <Textarea id="objectives" rows={3} {...register("objectives")} />
      </div>

      <div>
        <label htmlFor="methodology" className="mb-1.5 block text-sm font-medium text-foreground">
          Methodology
        </label>
        <Textarea id="methodology" rows={3} {...register("methodology")} />
      </div>

      <div>
        <label htmlFor="expectedOutput" className="mb-1.5 block text-sm font-medium text-foreground">
          Expected Output
        </label>
        <Textarea id="expectedOutput" rows={3} {...register("expectedOutput")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="urgency" className="mb-1.5 block text-sm font-medium text-foreground">
            Urgency
          </label>
          <Textarea id="urgency" rows={2} {...register("urgency")} />
        </div>
        <div>
          <label htmlFor="novelty" className="mb-1.5 block text-sm font-medium text-foreground">
            Novelty
          </label>
          <Textarea id="novelty" rows={2} {...register("novelty")} />
        </div>
        <div>
          <label htmlFor="applicationPotential" className="mb-1.5 block text-sm font-medium text-foreground">
            Application Potential
          </label>
          <Textarea id="applicationPotential" rows={2} {...register("applicationPotential")} />
        </div>
        <div>
          <label htmlFor="transferPotential" className="mb-1.5 block text-sm font-medium text-foreground">
            Transfer Potential
          </label>
          <Textarea id="transferPotential" rows={2} {...register("transferPotential")} />
        </div>
      </div>

      <div>
        <label htmlFor="facilities" className="mb-1.5 block text-sm font-medium text-foreground">
          Facilities &amp; Resources
        </label>
        <Textarea id="facilities" rows={2} {...register("facilities")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fundingMethod" className="mb-1.5 block text-sm font-medium text-foreground">
            Funding Method
          </label>
          <Input id="fundingMethod" {...register("fundingMethod")} />
        </div>
        <div>
          <label htmlFor="durationMonths" className="mb-1.5 block text-sm font-medium text-foreground">
            Duration (months)
          </label>
          <Input
            id="durationMonths"
            type="number"
            aria-invalid={Boolean(errors.durationMonths)}
            {...register("durationMonths", { valueAsNumber: true })}
          />
          {errors.durationMonths && <p className="mt-1 text-xs text-destructive">{errors.durationMonths.message}</p>}
        </div>
      </div>
    </div>
  );
}
