import { useState } from "react";
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
    return <p className="text-sm text-muted-foreground">Select a research type in the previous step first.</p>;
  }

  return (
    <div className="space-y-5">
      {isApplied && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Imported Research Topic</label>
          <Controller
            control={control}
            name="orderId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value.toString() : undefined}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={cycleOrders.length ? "Select a topic" : "No topics for this cycle"} />
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
          label={isApplied ? "Upload your proposal" : "Upload PDF or DOCX"}
          hint="Drag & drop, or click to browse (.pdf, .doc, .docx)"
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
            Check similarity
          </Button>

          {similarityMutation.isPending && <IndeterminateProgressBar label="Comparing your file against the selected topic..." />}

          {similarity && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"
            >
              <Badge variant={similarity.passed ? "secondary" : "destructive"}>{similarity.score}% match</Badge>
              <span className="text-muted-foreground">
                {similarity.passed ? "Looks like a good match with the selected topic." : "Similarity is below the recommended threshold."}
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
            Analyze with AI
          </Button>

          {extractMutation.isPending && <IndeterminateProgressBar label="Extracting title, abstract, and keywords..." />}

          {extraction && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 rounded-lg border border-border p-3 text-sm"
            >
              <p className="text-xs font-medium text-muted-foreground">AI suggested research area</p>
              <Badge variant="secondary">{extraction.researchArea}</Badge>
              <p className="pt-1 text-xs font-medium text-muted-foreground">Keywords</p>
              <div className="flex flex-wrap gap-1">
                {extraction.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                Title and abstract were auto-filled into the next step — feel free to edit them.
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
