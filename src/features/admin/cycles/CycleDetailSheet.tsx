import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { data: cycle, isLoading } = useCycleQuery(cycleId);
  const { data: researchTypes } = useResearchTypesQuery();
  const researchTypeName = researchTypes?.find((rt) => rt.id === cycle?.researchTypeId)?.name;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={cycle?.name ?? t("cycles.detailsTitle")}
      description={cycle?.academicYear}
      isLoading={isLoading}
      fields={[
        { label: t("common.status"), value: cycle && <StatusBadge status={cycle.status} /> },
        { label: t("cycles.researchType"), value: researchTypeName ?? cycle?.researchTypeId },
        { label: t("cycles.submissionStart"), value: cycle ? formatDate(cycle.submissionStartDate) : undefined },
        { label: t("cycles.submissionDeadline"), value: cycle ? formatDate(cycle.submissionDeadline) : undefined },
        { label: t("common.description"), value: cycle?.description },
      ]}
    />
  );
}
