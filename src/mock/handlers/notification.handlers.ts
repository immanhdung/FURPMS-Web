import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/env";
import { MOCK_NOTIFICATIONS } from "@/mock/data/notifications";
import type { ApiResponse } from "@/types/common";
import type { AppNotification } from "@/types/notification";

const notifications = MOCK_NOTIFICATIONS.map((n) => ({ ...n }));

export const notificationHandlers = [
  http.get(`${API_BASE_URL}/notifications`, () => {
    const response: ApiResponse<AppNotification[]> = { success: true, data: notifications };
    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE_URL}/notifications/count`, () => {
    const response: ApiResponse<number> = { success: true, data: notifications.filter((n) => !n.read).length };
    return HttpResponse.json(response);
  }),

  http.patch(`${API_BASE_URL}/notifications/read-all`, () => {
    notifications.forEach((n) => {
      n.read = true;
    });
    const response: ApiResponse<null> = { success: true, data: null };
    return HttpResponse.json(response);
  }),

  http.patch(`${API_BASE_URL}/notifications/:id/read`, ({ params }) => {
    const notification = notifications.find((n) => n.id === params.id);
    if (notification) notification.read = true;
    const response: ApiResponse<null> = { success: true, data: null };
    return HttpResponse.json(response);
  }),
];
