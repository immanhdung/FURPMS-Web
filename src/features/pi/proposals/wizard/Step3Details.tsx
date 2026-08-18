import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { BudgetBreakdownTable } from "@/features/pi/proposals/wizard/BudgetBreakdownTable";
import { ExpectedProductsCard } from "@/features/pi/proposals/ExpectedProductsCard";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";
import { researchTypeDisplayName } from "@/utils/research-type";

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

export function Step3Details({
  form,
  proposalId,
}: {
  form: UseFormReturn<ProposalWizardValues>;
  /** Có khi đang SỬA đề cương đã lưu — sản phẩm cam kết gắn với đề cương nên cần id. */
  proposalId?: string;
}) {
  const { t } = useTranslation();
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  // Trần kinh phí suy từ LOẠI ĐỀ TÀI của đợt (bước 1 đã chốt) — hiện ngay lúc gõ, đừng để chủ
  // nhiệm điền xong cả đề cương rồi mới ăn 400 ở bước nộp.
  const { data: researchTypes } = useResearchTypesQuery();
  const selectedType = researchTypes?.find((rt) => Number(rt.id) === Number(watch("researchType")));
  const cap = selectedType?.maxBudgetCap && selectedType.maxBudgetCap > 0 ? selectedType.maxBudgetCap : null;
  const capType = researchTypeDisplayName(selectedType, t);

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

      {/* Bỏ ô "Phương thức cấp kinh phí" (Trọn gói / Theo mốc): lịch giải ngân do LOẠI ĐỀ TÀI
          quyết định theo QĐ543 Điều 16, chủ nhiệm không có quyền chọn — để ô đó lại là hứa với PI
          một lựa chọn không tồn tại. Thay bằng tổng dự toán, có trần Điều 14 hiện ngay tại chỗ. */}
      <Section title={t("wizard.step3.secPlan")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="budget-LABOR">{t("wizard.step3.totalBudget")}</FieldLabel>
            <BudgetBreakdownTable form={form} cap={cap} capType={capType} />
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

      {/*
        Sản phẩm cam kết — QĐ543 Điều 11.1: hồ sơ nghiệm thu gồm "các sản phẩm cam kết theo Đề
        cương/Hợp đồng". Trước đây wizard hoàn toàn không có mục này nên nộp lần đầu là thiếu, phải
        vào màn chi tiết khai bù mà chẳng ai nhắc.

        Sản phẩm gắn với đề cương đã lưu nên chỉ hiện khi đã có id: đề cương mới thì bấm "Lưu nháp"
        một lần rồi quay lại bước này.
      */}
      <Section title={t("wizard.step3.secProducts")} hint={t("wizard.step3.secProductsHint")}>
        {proposalId ? (
          <ExpectedProductsCard proposalId={proposalId} editable />
        ) : (
          <p className="text-sm text-muted-foreground">{t("wizard.step3.productsNeedDraft")}</p>
        )}
      </Section>
    </div>
  );
}
