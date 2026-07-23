import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";

export function Step4TeamMembers({ form }: { form: UseFormReturn<ProposalWizardValues> }) {
  const { t } = useTranslation();
  const {
    control,
    register,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t("wizard.step4.intro")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              fullName: "",
              email: "",
              department: "",
              role: "",
              workMonths: 0,
              academicTitle: "",
              memberRoleCode: "",
              isSecretary: false,
            })
          }
        >
          <Plus />
          {t("wizard.step4.addMember")}
        </Button>
      </div>

      {fields.length === 0 ? (
        <EmptyState icon={Users} title={t("wizard.step4.empty")} description={t("wizard.step4.emptyDesc")} className="min-h-40" />
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <motion.div key={field.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{t("wizard.step4.member")} {index + 1}</p>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove member ${index + 1}`} onClick={() => remove(index)}>
                      <Trash2 />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("wizard.step4.fullName")}</label>
                      <Input aria-invalid={Boolean(errors.members?.[index]?.fullName)} {...register(`members.${index}.fullName`)} />
                      {errors.members?.[index]?.fullName && (
                        <p className="mt-1 text-xs text-destructive">{errors.members[index]?.fullName?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("wizard.step4.email")}</label>
                      <Input type="email" aria-invalid={Boolean(errors.members?.[index]?.email)} {...register(`members.${index}.email`)} />
                      {errors.members?.[index]?.email && (
                        <p className="mt-1 text-xs text-destructive">{errors.members[index]?.email?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("wizard.step4.department")}</label>
                      <Input {...register(`members.${index}.department`)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("wizard.step4.academicTitle")}</label>
                      <Input {...register(`members.${index}.academicTitle`)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("wizard.step4.role")}</label>
                      <Input placeholder={t("wizard.step4.rolePlaceholder")} {...register(`members.${index}.role`)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("wizard.step4.workMonths")}</label>
                      <Input type="number" step="0.5" {...register(`members.${index}.workMonths`, { valueAsNumber: true })} />
                    </div>
                  </div>

                  <Controller
                    control={control}
                    name={`members.${index}.isSecretary`}
                    render={({ field: checkboxField }) => (
                      <label className="flex items-center gap-2 text-xs text-foreground">
                        <Checkbox
                          checked={checkboxField.value}
                          onCheckedChange={(checked) => checkboxField.onChange(Boolean(checked))}
                        />
                        {t("wizard.step4.secretary")}
                      </label>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
