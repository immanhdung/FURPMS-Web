import { USE_MOCK_API } from "@/constants/env";
import { authHandlers } from "@/mock/handlers/auth.handlers";
import { notificationHandlers } from "@/mock/handlers/notification.handlers";
import { analyticsHandlers } from "@/mock/handlers/analytics.handlers";
import { researchTypeHandlers } from "@/mock/handlers/research-type.handlers";
import { googleMeetHandlers } from "@/mock/handlers/google-meet.handlers";
import { aiHandlers } from "@/mock/handlers/ai.handlers";

/**
 * Notifications, dashboard analytics, research types, the Google Meet link generator, and the AI
 * extraction/similarity endpoints have no real backend implementation we're wiring up yet, so
 * they're always mocked in development. Auth only mocks when USE_MOCK_API is on — otherwise it
 * hits the real backend, and unmatched real requests simply bypass MSW (see main.tsx).
 */
export const handlers = [
  ...notificationHandlers,
  ...analyticsHandlers,
  ...researchTypeHandlers,
  ...googleMeetHandlers,
  ...aiHandlers,
  ...(USE_MOCK_API ? authHandlers : []),
];
