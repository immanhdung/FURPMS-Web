import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { CircleAlert, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { useProposalDocumentsQuery } from "@/hooks/useProposalDocuments";
import { useUploadPolicyQuery } from "@/hooks/useSystemSettings";
import { formatDateTime } from "@/utils/format";
import { IndeterminateProgressBar } from "@/components/shared/ProgressBar";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { useResearchOrdersQuery } from "@/hooks/useResearchOrders";
import { useExtractProposalMutation } from "@/hooks/useProposalAi";
import { useAiCooldown } from "@/hooks/useAiCooldown";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";
import type { AiExtractionResult } from "@/types/ai-extraction";

interface Step2Props {
  form: UseFormReturn<ProposalWizardValues>;
  /** Có khi đang SỬA đề cương đã lưu — để liệt kê tài liệu đã đính kèm trước đó. */
  proposalId?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function Step2ResearchContent({ form, file, onFileChange, proposalId }: Step2Props) {
  const { t } = useTranslation();
  const { control, watch, setValue, getValues, getFieldState } = form;
  const researchTypeId = watch("researchType");
  const cycleId = watch("cycleId");

  /*
   * Đang SỬA một đề cương đã lưu thì phải thấy tài liệu đã đính kèm.
   *
   * Trước đây bước này chỉ biết `file` — tệp vừa chọn trong phiên hiện tại — nên mở lại đề cương
   * cũ là khung đính kèm trắng trơn, chủ nhiệm tưởng mất bài (màn Xem thì vẫn hiện đủ).
   */
  const { data: attached } = useProposalDocumentsQuery(proposalId ?? null);

  const { data: researchTypes } = useResearchTypesQuery();
  const selectedType = researchTypes?.find((rt) => rt.id === researchTypeId);
  const isApplied = Boolean(selectedType?.requireOrderingUnit);

  // Filtered server-side (cycleId is a supported query param) rather than client-side, so a
  // permission/scoping mismatch on the unfiltered list doesn't silently hide topics that do
  // belong to this cycle.
  const { data: cycleOrders } = useResearchOrdersQuery(cycleId ? { cycleId } : undefined);

  const extractMutation = useExtractProposalMutation();
  const aiCooldown = useAiCooldown();
  const { data: uploadPolicy } = useUploadPolicyQuery();

  const [extraction, setExtraction] = useState<{
    result: AiExtractionResult;
    applied: string[];
    preserved: string[];
  } | null>(null);

  const applyExtraction = (result: AiExtractionResult) => {
    const applied: string[] = [];
    const preserved: string[] = [];
    type TextField =
      | "titleVI"
      | "titleEN"
      | "abstractEN"
      | "objectives"
      | "methodology"
      | "expectedOutput"
      | "urgency"
      | "novelty"
      | "applicationPotential"
      | "transferPotential"
      | "facilities";

    // AI chỉ điền ô trống. Với bản nháp đã có nội dung, dữ liệu người dùng là nguồn ưu tiên và
    // được giữ nguyên; card kết quả nói rõ ô nào đã được bảo vệ để họ tự đối chiếu nếu cần.
    const fill = (field: TextField, value: string | null | undefined, label: string) => {
      if (!value?.trim()) return;
      if (getValues(field)?.trim()) {
        preserved.push(label);
        return;
      }
      setValue(field, value.trim(), { shouldValidate: true, shouldDirty: true });
      applied.push(label);
    };

    fill("titleVI", result.titleVi, t("wizard.step2.fieldTitleVI"));
    fill("titleEN", result.titleEn, t("wizard.step2.fieldTitleEN"));
    fill("abstractEN", result.abstractVi, t("wizard.step2.fieldAbstract"));
    fill("objectives", result.researchObjectives, t("wizard.step2.fieldObjectives"));
    fill("methodology", result.methodology, t("wizard.step2.fieldMethodology"));
    fill("expectedOutput", result.expectedOutput, t("wizard.step2.fieldExpectedOutput"));
    fill("urgency", result.urgency, t("wizard.step2.fieldUrgency"));
    fill("novelty", result.novelty, t("wizard.step2.fieldNovelty"));
    fill("applicationPotential", result.applicationPotential, t("wizard.step2.fieldApplicationPotential"));
    fill("transferPotential", result.transferPotential, t("wizard.step2.fieldTransferPotential"));
    fill("facilities", result.facilities, t("wizard.step2.fieldFacilities"));

    if (result.durationMonths && result.durationMonths > 0) {
      const label = t("wizard.step2.fieldDuration");
      if (getFieldState("durationMonths").isDirty) preserved.push(label);
      else {
        setValue("durationMonths", result.durationMonths, { shouldValidate: true, shouldDirty: true });
        applied.push(label);
      }
    }

    if (result.budgetItems?.length) {
      const label = t("wizard.step2.fieldBudget");
      const current = getValues("budgetItems") ?? [];
      if (getFieldState("budgetItems").isDirty || current.length > 0) preserved.push(label);
      else {
        setValue(
          "budgetItems",
          result.budgetItems
            .filter((item) => item.amount > 0)
            .map((item) => ({ category: item.category, amount: item.amount })),
          { shouldValidate: true, shouldDirty: true }
        );
        applied.push(label);
      }
    }

    if (result.teamMembers?.length) {
      const label = t("wizard.step2.fieldMembers");
      const current = getValues("members") ?? [];
      if (getFieldState("members").isDirty || current.length > 0) preserved.push(label);
      else {
        setValue(
          "members",
          result.teamMembers.map((member) => ({
            fullName: member.fullName,
            email: member.email?.trim() ?? "",
            department: member.department ?? "",
            academicTitle: member.academicTitle ?? "",
            role: member.role ?? "",
            workMonths: member.workMonths ?? 0,
            memberRoleCode: "",
            isSecretary: member.isSecretary,
          })),
          { shouldValidate: true, shouldDirty: true }
        );
        applied.push(label);
      }
    }

    setExtraction({ result, applied, preserved });
  };

  const runExtraction = () => {
    if (!file) return;
    extractMutation.mutate(file, {
      onSuccess: applyExtraction,
      onSettled: () => aiCooldown.start(),
    });
  };

  const maxFileSizeMb = uploadPolicy?.maxFileSizeMb ?? 10;


  if (!selectedType) {
    return <p className="text-sm text-muted-foreground">{t("wizard.step2.selectTypeFirst")}</p>;
  }

  return (
    <div className="space-y-5">
      <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        {t("wizard.step2.optionalHint")}{" "}
        <span className="font-medium text-foreground">{t("wizard.next")}</span> {t("wizard.step2.optionalHintNext")}
      </p>

      {isApplied && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("wizard.step2.importedTopic")}</label>
          <Controller
            control={control}
            name="orderId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : undefined}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={cycleOrders?.length ? t("wizard.step2.selectTopic") : t("wizard.step2.noTopics")} />
                </SelectTrigger>
                <SelectContent>
                  {cycleOrders?.map((order) => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      {order.researchArea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <div>
        {(attached?.length ?? 0) > 0 && (
          <div className="mb-3 space-y-1.5 rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">{t("wizard.step2.alreadyAttached")}</p>
            <ul className="space-y-1">
              {attached!.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-x-2 text-sm text-foreground">
                  <span className="font-medium">{d.fileName}</span>
                  <span className="text-xs text-muted-foreground">
                    {d.documentType ? `${d.documentType} · ` : ""}
                    {d.uploadedAt ? formatDateTime(d.uploadedAt) : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">{t("wizard.step2.attachMoreHint")}</p>
          </div>
        )}

        <FileDropzone
          file={file}
          onFileSelect={(selected) => {
            onFileChange(selected);
            setExtraction(null);
          }}
          onRemove={() => {
            onFileChange(null);
            setExtraction(null);
          }}
          label={isApplied ? t("wizard.step2.uploadApplied") : t("wizard.step2.uploadBasic")}
          hint={t("wizard.step2.dropHint", { max: maxFileSizeMb })}
          accept=".pdf,.docx"
          maxSizeMb={maxFileSizeMb}
        />
      </div>

      {/*
        Trước đây khối này rẽ nhánh: đề tài ỨNG DỤNG thì hiện "Kiểm tra trùng lặp", CƠ BẢN mới có
        "AI đọc file điền hộ". Hai vấn đề: nút kiểm tra trùng lặp gọi `/ai/similarity-check` mà BE
        KHÔNG hề có endpoint đó (bấm là lỗi), và chủ nhiệm đề tài ứng dụng thì vĩnh viễn không dùng
        được AI điền hộ — trong khi đó mới là thứ chạy thật.
        Nay bỏ nhánh, ai cũng dùng chung một đường.
      */}
        <div className="space-y-3">
          <Button type="button" variant="outline" disabled={!file || extractMutation.isPending || aiCooldown.seconds > 0} onClick={runExtraction}>
            {extractMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {aiCooldown.seconds > 0
              ? t("proposal.aiCooldown", { seconds: aiCooldown.seconds })
              : t("wizard.step2.analyzeAi")}
          </Button>

          {extractMutation.isPending && <IndeterminateProgressBar label={t("wizard.step2.extracting")} />}

          {extraction && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 rounded-lg border border-border p-3 text-sm"
            >
              {extraction.result.warning ? (
                <p className="text-xs text-warning">{extraction.result.warning}</p>
              ) : extraction.applied.length === 0 &&
                extraction.preserved.length === 0 &&
                !(extraction.result.totalBudget && extraction.result.totalBudget > 0) &&
                !extraction.result.budgetItems?.length &&
                !extraction.result.teamMembers?.length ? (
                <p className="text-xs text-muted-foreground">{t("wizard.step2.nothingExtracted")}</p>
              ) : (
                <>
                  {extraction.applied.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">{t("wizard.step2.filledFields")}</p>
                      <div className="flex flex-wrap gap-1">
                        {extraction.applied.map((label) => (
                          <Badge key={label} variant="outline">{label}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {extraction.preserved.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1 text-xs font-medium text-warning">
                        <CircleAlert className="size-3.5" />
                        {t("wizard.step2.preservedFields")}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {extraction.preserved.map((label) => (
                          <Badge key={label} variant="outline">{label}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {extraction.result.totalBudget && extraction.result.totalBudget > 0 && !extraction.result.budgetItems?.length && (
                    <p className="text-xs text-muted-foreground">
                      {t("wizard.step2.budgetDetected", {
                        amount: new Intl.NumberFormat(undefined).format(extraction.result.totalBudget),
                      })}
                    </p>
                  )}
                  <p className="pt-1 text-xs text-muted-foreground">{t("wizard.step2.autoFilled")}</p>
                </>
              )}
            </motion.div>
          )}
        </div>
    </div>
  );
}
