import type { UseFormReturn } from "react-hook-form";
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
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Review your proposal before submitting. You can go back to any step to make changes.
      </p>
      <ProposalSummaryView data={values} cycleName={cycleName} trackName={trackName} researchTypeName={researchTypeName} />
    </div>
  );
}
