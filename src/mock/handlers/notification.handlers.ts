import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/env";
import { MOCK_NOTIFICATIONS } from "@/mock/data/notifications";

const notifications = MOCK_NOTIFICATIONS.map((n) => ({ ...n }));

export const notificationHandlers = [
  http.get(`${API_BASE_URL}/notifications`, () => {
    return HttpResponse.json(notifications);
  }),

  http.patch(`${API_BASE_URL}/notifications/read-all`, () => {
    notifications.forEach((n) => {
      n.read = true;
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${API_BASE_URL}/notifications/:id/read`, ({ params }) => {
    const notification = notifications.find((n) => n.id === params.id);
    if (notification) notification.read = true;
    return new HttpResponse(null, { status: 204 });
  }),
];
