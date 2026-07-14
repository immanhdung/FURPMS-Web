import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/env";
import { MOCK_PI_DASHBOARD, MOCK_REVIEWER_DASHBOARD, MOCK_STAFF_DASHBOARD } from "@/mock/data/dashboard";
import type { ApiResponse } from "@/types/common";

export const analyticsHandlers = [
  http.get(`${API_BASE_URL}/analytics/dashboard/staff`, async () => {
    await delay(300);
    const response: ApiResponse<typeof MOCK_STAFF_DASHBOARD> = { success: true, data: MOCK_STAFF_DASHBOARD };
    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE_URL}/analytics/dashboard/faculty`, async () => {
    await delay(300);
    const response: ApiResponse<typeof MOCK_PI_DASHBOARD> = { success: true, data: MOCK_PI_DASHBOARD };
    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE_URL}/analytics/dashboard/reviewer`, async () => {
    await delay(300);
    const response: ApiResponse<typeof MOCK_REVIEWER_DASHBOARD> = { success: true, data: MOCK_REVIEWER_DASHBOARD };
    return HttpResponse.json(response);
  }),
];
