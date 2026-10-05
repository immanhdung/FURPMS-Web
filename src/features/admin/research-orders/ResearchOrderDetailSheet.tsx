import { useTranslation } from "react-i18next";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useResearchOrderQuery } from "@/hooks/useResearchOrders";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useOrganizationalUnitsQuery } from "@/hooks/useOrganizationalUnits";

interface ResearchOrderDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
}

export function ResearchOrderDetailSheet({ open, onOpenChange, orderId }: ResearchOrderDetailSheetProps) {
  const { t } = useTranslation();
  const { data: order, isLoading } = useResearchOrderQuery(orderId);
  const { data: cycles } = useCyclesQuery();
  const { data: units } = useOrganizationalUnitsQuery();

  const cycleName = cycles?.find((c) => c.id === order?.cycleId)?.name;
  const unitName = units?.find((u) => u.id === order?.orderingUnitId)?.name;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={order?.researchArea ?? t("researchOrders.detailsTitle")}
      isLoading={isLoading}
      fields={[
        { label: t("common.status"), value: order?.status ? <StatusBadge status={order.status} /> : "-" },
        { label: t("researchOrders.cycle"), value: cycleName ?? order?.cycleId },
        { label: t("researchOrders.orderingUnit"), value: unitName ?? order?.orderingUnitId },
        { label: t("researchOrders.problemDescription"), value: order?.problemDescription },
        { label: t("researchOrders.expectedProducts"), value: order?.expectedProducts },
      ]}
    />
  );
}
