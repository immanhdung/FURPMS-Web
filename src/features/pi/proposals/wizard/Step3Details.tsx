import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <Section title={t("wizard.step3.secTitleAbstract")} hint={t("wizard.step3.secTitleAbstractHint")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="titleVI" required>
              {t("wizard.step3.titleVI")}
            </FieldLabel>
            <Input
              id="titleVI"
              placeholder={t("wizard.step3.titleVIPlaceholder")}
              aria-invalid={Boolean(errors.titleVI)}
              {...register("titleVI")}
            />
            {errors.titleVI && <p className="mt-1 text-xs text-destructive">{errors.titleVI.message}</p>}
          </div>
          <div>
            <FieldLabel htmlFor="titleEN">{t("wizard.step3.titleEN")}</FieldLabel>
            <Input id="titleEN" placeholder={t("wizard.step3.titleENPlaceholder")} {...register("titleEN")} />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="abstractEN">{t("wizard.step3.abstract")}</FieldLabel>
          <Textarea
            id="abstractEN"
            rows={4}
            placeholder={t("wizard.step3.abstractPlaceholder")}
            {...register("abstractEN")}
          />
        </div>
      </Section>

      <Section title={t("wizard.step3.secDescription")} hint={t("wizard.step3.secDescriptionHint")}>
        <div>
          <FieldLabel htmlFor="objectives" required>
            {t("wizard.step3.objectives")}
          </FieldLabel>
          <Textarea
            id="objectives"
            rows={3}
            placeholder={t("wizard.step3.objectivesPlaceholder")}
            aria-invalid={Boolean(errors.objectives)}
            {...register("objectives")}
          />
          {errors.objectives && <p className="mt-1 text-xs text-destructive">{errors.objectives.message}</p>}
        </div>

        <div>
          <FieldLabel htmlFor="methodology">{t("wizard.step3.methodology")}</FieldLabel>
          <Textarea id="methodology" rows={3} placeholder={t("wizard.step3.methodologyPlaceholder")} {...register("methodology")} />
        </div>

        <div>
          <FieldLabel htmlFor="expectedOutput">{t("wizard.step3.expectedOutput")}</FieldLabel>
          <Textarea
            id="expectedOutput"
            rows={3}
            placeholder={t("wizard.step3.expectedOutputPlaceholder")}
            {...register("expectedOutput")}
          />
        </div>
      </Section>

      <Section title={t("wizard.step3.secImpact")} hint={t("wizard.step3.secImpactHint")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="urgency">{t("wizard.step3.urgency")}</FieldLabel>
            <Textarea id="urgency" rows={2} placeholder={t("wizard.step3.urgencyPlaceholder")} {...register("urgency")} />
          </div>
          <div>
            <FieldLabel htmlFor="novelty">{t("wizard.step3.novelty")}</FieldLabel>
            <Textarea id="novelty" rows={2} placeholder={t("wizard.step3.noveltyPlaceholder")} {...register("novelty")} />
          </div>
          <div>
            <FieldLabel htmlFor="applicationPotential">{t("wizard.step3.applicationPotential")}</FieldLabel>
            <Textarea id="applicationPotential" rows={2} {...register("applicationPotential")} />
          </div>
          <div>
            <FieldLabel htmlFor="transferPotential">{t("wizard.step3.transferPotential")}</FieldLabel>
            <Textarea id="transferPotential" rows={2} {...register("transferPotential")} />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="facilities">{t("wizard.step3.facilities")}</FieldLabel>
          <Textarea
            id="facilities"
            rows={2}
            placeholder={t("wizard.step3.facilitiesPlaceholder")}
            {...register("facilities")}
          />
        </div>
      </Section>

      <Section title={t("wizard.step3.secPlan")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="fundingMethod">{t("wizard.step3.fundingMethod")}</FieldLabel>
            <Controller
              control={control}
              name="fundingMethod"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id="fundingMethod" className="w-full">
                    <SelectValue placeholder={t("wizard.step3.fundingPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHOLE">{t("wizard.step3.fundingWhole")}</SelectItem>
                    <SelectItem value="PARTIAL">{t("wizard.step3.fundingPartial")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <FieldLabel htmlFor="durationMonths" required>
              {t("wizard.step3.duration")}
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
