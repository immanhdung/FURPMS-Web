import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { useProposalDocumentsQuery } from "@/hooks/useProposalDocuments";
import { formatDateTime } from "@/utils/format";
import { IndeterminateProgressBar } from "@/components/shared/ProgressBar";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { useResearchOrdersQuery } from "@/hooks/useResearchOrders";
import { useExtractProposalMutation } from "@/hooks/useProposalAi";
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
  const { control, watch, setValue } = form;
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

  const [extraction, setExtraction] = useState<AiExtractionResult | null>(null);

  const applyExtraction = (result: AiExtractionResult) => {
    setExtraction(result);
    // Chỉ ghi đè field AI thật sự đọc được — không xoá trắng thứ PI đã gõ tay.
    const fill = (field: "titleVI" | "titleEN" | "abstractEN" | "objectives" | "methodology" | "expectedOutput",
                  value?: string | null) => {
      if (value?.trim()) setValue(field, value.trim(), { shouldValidate: true });
    };

    fill("titleVI", result.titleVi);
    fill("titleEN", result.titleEn);
    fill("abstractEN", result.abstractVi);
    fill("objectives", result.researchObjectives);
    fill("methodology", result.methodology);
    fill("expectedOutput", result.expectedOutput);
    if (result.durationMonths) setValue("durationMonths", result.durationMonths, { shouldValidate: true });
  };

  /** Nhãn các trường AI đã điền, để PI biết cần soát lại chỗ nào (rule #10: AI chỉ prefill, PI vẫn duyệt). */
  const filledFields = (result: AiExtractionResult) =>
    [
      result.titleVi && t("wizard.step2.fieldTitleVI"),
      result.titleEn && t("wizard.step2.fieldTitleEN"),
      result.abstractVi && t("wizard.step2.fieldAbstract"),
      result.researchObjectives && t("wizard.step2.fieldObjectives"),
      result.methodology && t("wizard.step2.fieldMethodology"),
      result.expectedOutput && t("wizard.step2.fieldExpectedOutput"),
      result.durationMonths && t("wizard.step2.fieldDuration"),
    ].filter(Boolean) as string[];

  const runExtraction = () => {
    if (!file) return;
    extractMutation.mutate(file, { onSuccess: applyExtraction });
  };


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
          hint={t("wizard.step2.dropHint")}
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
          <Button type="button" variant="outline" disabled={!file || extractMutation.isPending} onClick={runExtraction}>
            {extractMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {t("wizard.step2.analyzeAi")}
          </Button>

          {extractMutation.isPending && <IndeterminateProgressBar label={t("wizard.step2.extracting")} />}

          {extraction && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 rounded-lg border border-border p-3 text-sm"
            >
              {extraction.warning ? (
                <p className="text-xs text-warning">{extraction.warning}</p>
              ) : filledFields(extraction).length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("wizard.step2.nothingExtracted")}</p>
              ) : (
                <>
                  <p className="text-xs font-medium text-muted-foreground">{t("wizard.step2.filledFields")}</p>
                  <div className="flex flex-wrap gap-1">
                    {filledFields(extraction).map((label) => (
                      <Badge key={label} variant="outline">
                        {label}
                      </Badge>
                    ))}
                  </div>
                  <p className="pt-1 text-xs text-muted-foreground">{t("wizard.step2.autoFilled")}</p>
                </>
              )}
            </motion.div>
          )}
        </div>
    </div>
  );
}
