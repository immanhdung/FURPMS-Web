import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";

/** Small helpers so labels/sections stay consistent without repeating classes. */
function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
      {required && <span className="text-destructive"> *</span>}
    </label>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function Step3Details({ form }: { form: UseFormReturn<ProposalWizardValues> }) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <Section title="Title & abstract" hint="The Vietnamese title is what appears on official documents.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="titleVI" required>
              Title (Vietnamese)
            </FieldLabel>
            <Input
              id="titleVI"
              placeholder="Tên đề tài bằng tiếng Việt"
              aria-invalid={Boolean(errors.titleVI)}
              {...register("titleVI")}
            />
            {errors.titleVI && <p className="mt-1 text-xs text-destructive">{errors.titleVI.message}</p>}
          </div>
          <div>
            <FieldLabel htmlFor="titleEN">Title (English)</FieldLabel>
            <Input id="titleEN" placeholder="English title, if available" {...register("titleEN")} />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="abstractEN">Abstract</FieldLabel>
          <Textarea
            id="abstractEN"
            rows={4}
            placeholder="A short summary of the problem, approach, and expected result"
            {...register("abstractEN")}
          />
        </div>
      </Section>

      <Section title="Research description" hint="What you will do and how — reviewers score these sections.">
        <div>
          <FieldLabel htmlFor="objectives" required>
            Objectives
          </FieldLabel>
          <Textarea
            id="objectives"
            rows={3}
            placeholder="e.g. 1. Survey current practice  2. Build the model  3. Evaluate on real data"
            aria-invalid={Boolean(errors.objectives)}
            {...register("objectives")}
          />
          {errors.objectives && <p className="mt-1 text-xs text-destructive">{errors.objectives.message}</p>}
        </div>

        <div>
          <FieldLabel htmlFor="methodology">Methodology</FieldLabel>
          <Textarea id="methodology" rows={3} placeholder="How the research will be carried out" {...register("methodology")} />
        </div>

        <div>
          <FieldLabel htmlFor="expectedOutput">Expected Output</FieldLabel>
          <Textarea
            id="expectedOutput"
            rows={3}
            placeholder="e.g. 1 conference paper, 1 demo application, 1 final report"
            {...register("expectedOutput")}
          />
        </div>
      </Section>

      <Section title="Impact & feasibility" hint="Optional, but they strengthen the proposal during review.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="urgency">Urgency</FieldLabel>
            <Textarea id="urgency" rows={2} placeholder="Why this research is needed now" {...register("urgency")} />
          </div>
          <div>
            <FieldLabel htmlFor="novelty">Novelty</FieldLabel>
            <Textarea id="novelty" rows={2} placeholder="What is new compared to existing work" {...register("novelty")} />
          </div>
          <div>
            <FieldLabel htmlFor="applicationPotential">Application Potential</FieldLabel>
            <Textarea id="applicationPotential" rows={2} {...register("applicationPotential")} />
          </div>
          <div>
            <FieldLabel htmlFor="transferPotential">Transfer Potential</FieldLabel>
            <Textarea id="transferPotential" rows={2} {...register("transferPotential")} />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="facilities">Facilities &amp; Resources</FieldLabel>
          <Textarea
            id="facilities"
            rows={2}
            placeholder="Labs, equipment, or data you already have access to"
            {...register("facilities")}
          />
        </div>
      </Section>

      <Section title="Plan & funding">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="fundingMethod">Funding Method</FieldLabel>
            <Controller
              control={control}
              name="fundingMethod"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id="fundingMethod" className="w-full">
                    <SelectValue placeholder="Select how funding is disbursed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHOLE">Whole — disbursed in fixed installments</SelectItem>
                    <SelectItem value="PARTIAL">Partial — disbursed per accepted milestone</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <FieldLabel htmlFor="durationMonths" required>
              Duration (months)
            </FieldLabel>
            <Input
              id="durationMonths"
              type="number"
              aria-invalid={Boolean(errors.durationMonths)}
              {...register("durationMonths", { valueAsNumber: true })}
            />
            {errors.durationMonths && <p className="mt-1 text-xs text-destructive">{errors.durationMonths.message}</p>}
          </div>
        </div>
      </Section>
    </div>
  );
}
