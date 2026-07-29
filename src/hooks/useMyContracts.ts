import { useMemo } from "react";
import { useContractsQuery } from "@/hooks/useContracts";
import { useMyProposalsQuery } from "@/hooks/useProposals";

/**
 * Trang PI (báo cáo tiến độ/sản phẩm/tổng kết) → `mine=true` ép BE **chỉ trả HĐ mình là PI**,
 * kể cả tài khoản đa vai (Staff/Admin đang "làm PI"). Trước đây gọi list không lọc → thấy cả HĐ
 * người khác rồi submit bị 403 "Only the PI may edit".
 */
export function useMyContractsQuery() {
  const { data: myProposals, isLoading: isProposalsLoading } = useMyProposalsQuery();
  const { data: contracts, isLoading: isContractsLoading } = useContractsQuery(true);

  const proposalTitleById = useMemo(
    () => new Map((myProposals ?? []).map((p) => [p.id, p.titleEN || p.titleVI || p.id])),
    [myProposals]
  );

  return { data: contracts ?? [], proposalTitleById, isLoading: isProposalsLoading || isContractsLoading };
}
