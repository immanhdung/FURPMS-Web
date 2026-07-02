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
  const { data: order, isLoading } = useResearchOrderQuery(orderId);
  const { data: cycles } = useCyclesQuery();
  const { data: units } = useOrganizationalUnitsQuery();

  const cycleName = cycles?.find((c) => c.id === order?.cycleId)?.name;
  const unitName = units?.find((u) => u.id === order?.orderingUnitId)?.name;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={order?.researchArea ?? "Research order details"}
      isLoading={isLoading}
      fields={[
        { label: "Status", value: order?.status ? <StatusBadge status={order.status} /> : "-" },
        { label: "Cycle", value: cycleName ?? order?.cycleId },
        { label: "Ordering unit", value: unitName ?? order?.orderingUnitId },
        { label: "Problem description", value: order?.problemDescription },
        { label: "Expected products", value: order?.expectedProducts },
      ]}
    />
  );
}
