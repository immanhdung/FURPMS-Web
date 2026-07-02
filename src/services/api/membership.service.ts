import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";
import type { MyMembership } from "@/types/membership";

export const membershipService = {
  mine: () =>
    axiosClient.get<ApiResponse<MyMembership[]>>("/councils/my-memberships").then((res) => res.data.data),
};
