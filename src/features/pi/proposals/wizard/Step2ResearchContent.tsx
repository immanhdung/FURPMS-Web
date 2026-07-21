import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Loader2, Sparkles, SearchCheck } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { IndeterminateProgressBar } from "@/components/shared/ProgressBar";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { useResearchOrdersQuery } from "@/hooks/useResearchOrders";
import { useExtractProposalMutation, useSimilarityCheckMutation } from "@/hooks/useProposalAi";
import { SimilarityWarningDialog } from "@/features/pi/proposals/wizard/SimilarityWarningDialog";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";
import type { AiExtractionResult, SimilarityCheckResult } from "@/types/ai-extraction";

interface Step2Props {
  form: UseFormReturn<ProposalWizardValues>;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function Step2ResearchContent({ form, file, onFileChange }: Step2Props) {
  const { t } = useTranslation();
  const { control, watch, setValue } = form;
  const researchTypeId = watch("researchType");
  const cycleId = watch("cycleId");

  const { data: researchTypes } = useResearchTypesQuery();
  const selectedType = researchTypes?.find((rt) => rt.id === researchTypeId);
  const isApplied = Boolean(selectedType?.requireOrderingUnit);

  const { data: orders } = useResearchOrdersQuery();
  const cycleOrders = (orders ?? []).filter((order) => order.cycleId === cycleId);

  const extractMutation = useExtractProposalMutation();
  const similarityMutation = useSimilarityCheckMutation();

  const [extraction, setExtraction] = useState<AiExtractionResult | null>(null);
  const [similarity, setSimilarity] = useState<SimilarityCheckResult | null>(null);
  const [warningOpen, setWarningOpen] = useState(false);

  const applyExtraction = (result: AiExtractionResult) => {
    setExtraction(result);
    setValue("titleEN", result.titleEN, { shouldValidate: true });
    if (result.titleVI) setValue("titleVI", result.titleVI);
    setValue("abstractEN", result.abstractEN, { shouldValidate: true });
  };

  const runExtraction = () => {
    if (!file) return;
    extractMutation.mutate(file, { onSuccess: applyExtraction });
  };

  const runSimilarityCheck = () => {
    const orderId = watch("orderId");
    if (!file || !orderId) return;
    similarityMutation.mutate(
      { file, topicId: orderId },
      {
        onSuccess: (result) => {
          setSimilarity(result);
          if (!result.passed) setWarningOpen(true);
        },
      }
    );
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
                  <SelectValue placeholder={cycleOrders.length ? t("wizard.step2.selectTopic") : t("wizard.step2.noTopics")} />
                </SelectTrigger>
                <SelectContent>
                  {cycleOrders.map((order) => (
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
        <FileDropzone
          file={file}
          onFileSelect={(selected) => {
            onFileChange(selected);
            setExtraction(null);
            setSimilarity(null);
          }}
          onRemove={() => {
            onFileChange(null);
            setExtraction(null);
            setSimilarity(null);
          }}
          label={isApplied ? t("wizard.step2.uploadApplied") : t("wizard.step2.uploadBasic")}
          hint={t("wizard.step2.dropHint")}
        />
      </div>

      {isApplied ? (
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            disabled={!file || !watch("orderId") || similarityMutation.isPending}
            onClick={runSimilarityCheck}
          >
            {similarityMutation.isPending ? <Loader2 className="animate-spin" /> : <SearchCheck />}
            {t("wizard.step2.checkSimilarity")}
          </Button>

          {similarityMutation.isPending && <IndeterminateProgressBar label={t("wizard.step2.comparing")} />}

          {similarity && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"
            >
              <Badge variant={similarity.passed ? "secondary" : "destructive"}>{similarity.score}{t("wizard.step2.matchSuffix")}</Badge>
              <span className="text-muted-foreground">
                {similarity.passed ? t("wizard.step2.matchGood") : t("wizard.step2.matchLow")}
              </span>
            </motion.div>
          )}

          <SimilarityWarningDialog
            open={warningOpen}
            onOpenChange={setWarningOpen}
            score={similarity?.score ?? 0}
            onContinue={() => {}}
          />
        </div>
      ) : (
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
              <p className="text-xs font-medium text-muted-foreground">{t("wizard.step2.aiSuggestedArea")}</p>
              <Badge variant="secondary">{extraction.researchArea}</Badge>
              <p className="pt-1 text-xs font-medium text-muted-foreground">{t("wizard.step2.keywords")}</p>
              <div className="flex flex-wrap gap-1">
                {extraction.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                {t("wizard.step2.autoFilled")}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
