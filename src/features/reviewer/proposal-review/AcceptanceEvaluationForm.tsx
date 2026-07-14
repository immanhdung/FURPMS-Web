import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAcceptanceQuery, useSubmitAcceptanceMutation } from "@/hooks/useAcceptance";
import { ACCEPTANCE_RESULTS } from "@/types/acceptance";

export function AcceptanceEvaluationForm({ councilId }: { councilId: string }) {
  const { data: existing, isLoading } = useAcceptanceQuery(councilId);
  const submitMutation = useSubmitAcceptanceMutation(councilId);

  const [result, setResult] = useState<string>(ACCEPTANCE_RESULTS[0]);
  const [failReason, setFailReason] = useState("");
  const [seededFor, setSeededFor] = useState<string | null>(null);

  if (existing && existing.id !== seededFor) {
    setSeededFor(existing.id);
    setResult(existing.result);
    setFailReason(existing.failReason ?? "");
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Result</label>
        <Select value={result} onValueChange={setResult}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCEPTANCE_RESULTS.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {result === "FAIL" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Fail reason</label>
          <Textarea rows={3} value={failReason} onChange={(e) => setFailReason(e.target.value)} />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => submitMutation.mutate({ result, failReason: result === "FAIL" ? failReason || undefined : undefined })}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {existing ? "Update evaluation" : "Submit evaluation"}
        </Button>
      </div>
    </div>
  );
}
