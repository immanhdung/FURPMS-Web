import type { UseFormReturn } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksQuery } from "@/hooks/useTracks";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { ProposalSummaryView } from "@/features/pi/proposals/ProposalSummaryView";
import type { ProposalWizardValues } from "@/features/pi/proposals/wizard/proposal-wizard.schema";

export function Step5Preview({ form }: { form: UseFormReturn<ProposalWizardValues> }) {
  const values = form.watch();
  const { data: cycles } = useCyclesQuery();
  const { data: tracks } = useTracksQuery();
  const { data: researchTypes } = useResearchTypesQuery();

  const cycleName = cycles?.find((c) => c.id === values.cycleId)?.name;
  const trackName = tracks?.find((t) => t.id.toString() === values.trackId)?.name;
  const researchTypeName = researchTypes?.find((rt) => rt.id === values.researchType)?.name;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/5 p-3 text-sm">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
        <p className="text-muted-foreground">
          Review your proposal before submitting. You can go back to any step to make changes.
        </p>
      </div>
      <ProposalSummaryView data={values} cycleName={cycleName} trackName={trackName} researchTypeName={researchTypeName} />
    </div>
  );
}
