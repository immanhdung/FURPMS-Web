import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { OrganizationalUnit, OrgUnitPayload } from "@/types/organizational-unit";

export const organizationalUnitService = {
  list: () =>
    axiosClient.get<ApiResponse<OrganizationalUnit[]>>("/organizational-units").then((res) => res.data.data),

  create: (payload: OrgUnitPayload) =>
    axiosClient.post<ApiResponse<OrganizationalUnit>>("/organizational-units", payload).then((res) => res.data.data),

  update: (id: number, payload: OrgUnitPayload) =>
    axiosClient
      .put<ApiResponse<OrganizationalUnit>>(`/organizational-units/${id}`, payload)
      .then((res) => res.data.data),
};
