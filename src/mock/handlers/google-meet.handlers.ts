import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/env";
import type { ApiResponse } from "@/types/common";

function randomSegment(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const googleMeetHandlers = [
  http.post(`${API_BASE_URL}/integrations/google-meet/generate`, async () => {
    await delay(400);
    const meetingLink = `https://meet.google.com/${randomSegment(3)}-${randomSegment(4)}-${randomSegment(3)}`;
    const response: ApiResponse<{ meetingLink: string }> = { success: true, data: { meetingLink } };
    return HttpResponse.json(response);
  }),
];
