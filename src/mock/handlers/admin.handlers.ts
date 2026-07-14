import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/env";
import type { ApiResponse } from "@/types/common";
import type { SystemClockState } from "@/types/admin";

let clockState: SystemClockState = { offsetDays: 0 };

export const adminHandlers = [
  http.get(`${API_BASE_URL}/admin/system-clock`, () => {
    const response: ApiResponse<SystemClockState> = { success: true, data: clockState };
    return HttpResponse.json(response);
  }),

  http.post(`${API_BASE_URL}/admin/system-clock`, async ({ request }) => {
    const body = (await request.json()) as Partial<SystemClockState>;
    clockState = { offsetDays: body.offsetDays ?? 0 };
    const response: ApiResponse<SystemClockState> = { success: true, data: clockState };
    return HttpResponse.json(response);
  }),

  http.post(`${API_BASE_URL}/admin/run-deadline-scan`, () => {
    const response: ApiResponse<null> = { success: true, data: null };
    return HttpResponse.json(response);
  }),
];
