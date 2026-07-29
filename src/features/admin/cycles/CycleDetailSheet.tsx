import { DetailSheet } from "@/components/shared/DetailSheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCycleQuery } from "@/hooks/useCycles";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { formatDate } from "@/utils/format";

interface CycleDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: number | null;
}

export function CycleDetailSheet({ open, onOpenChange, cycleId }: CycleDetailSheetProps) {
  const { data: cycle, isLoading } = useCycleQuery(cycleId);
  const { data: researchTypes } = useResearchTypesQuery();
  const researchTypeName = researchTypes?.find((rt) => rt.id === cycle?.researchTypeId)?.name;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={cycle?.name ?? "Cycle details"}
      description={cycle?.academicYear}
      isLoading={isLoading}
      fields={[
        { label: "Status", value: cycle && <StatusBadge status={cycle.status} /> },
        { label: "Research type", value: researchTypeName ?? cycle?.researchTypeId },
        {
          label: "Submission window",
          value: cycle && (
            <span className="inline-flex items-center gap-1.5">
              {formatDate(cycle.submissionStartDate)}
              <span className="text-muted-foreground">&rarr;</span>
              {formatDate(cycle.submissionDeadline)}
            </span>
          ),
        },
        { label: "Description", value: cycle?.description },
      ]}
    />
  );
}
