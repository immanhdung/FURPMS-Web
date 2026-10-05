import { useMemo } from "react";
import { useContractsQuery } from "@/hooks/useContracts";
import { useMyProposalsQuery } from "@/hooks/useProposals";

import { proposalTitle } from "@/utils/format";
/**
 * Trang PI (báo cáo tiến độ/sản phẩm/tổng kết) → `mine=true` ép BE **chỉ trả HĐ mình là PI**,
 * kể cả tài khoản đa vai (Staff/Admin đang "làm PI"). Trước đây gọi list không lọc → thấy cả HĐ
 * người khác rồi submit bị 403 "Only the PI may edit".
 */
export function useMyContractsQuery() {
  const { data: myProposals, isLoading: isProposalsLoading } = useMyProposalsQuery();
  const { data: contracts, isLoading: isContractsLoading } = useContractsQuery(true);

  const proposalTitleById = useMemo(
    () => new Map((myProposals ?? []).map((p) => [p.id, proposalTitle(p, p.id)])),
    [myProposals]
  );

  /**
   * Bản tóm tắt đề tài cho các màn chỉ có `contract` trong tay (vd Tiến trình đề tài).
   * Trước đây các màn đó chỉ hiện số hợp đồng + tên — thầy 05/08: *"hiện tại chỉ có 'abc06 Hợp
   * đồng 06', sửa lại chi tiết hơn: tên đề tài, ai là PI, mô tả đề tài"*.
   */
  const proposalById = useMemo(
    () => new Map((myProposals ?? []).map((p) => [p.id, p])),
    [myProposals]
  );

  return {
    data: contracts ?? [],
    proposalTitleById,
    proposalById,
    isLoading: isProposalsLoading || isContractsLoading,
  };
}
