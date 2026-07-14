import { USE_MOCK_API } from "@/constants/env";
import { authHandlers } from "@/mock/handlers/auth.handlers";
import { notificationHandlers } from "@/mock/handlers/notification.handlers";
import { analyticsHandlers } from "@/mock/handlers/analytics.handlers";
import { researchTypeHandlers } from "@/mock/handlers/research-type.handlers";
import { googleMeetHandlers } from "@/mock/handlers/google-meet.handlers";
import { aiHandlers, aiSummaryHandlers } from "@/mock/handlers/ai.handlers";
import { adminHandlers } from "@/mock/handlers/admin.handlers";

/**
 * Per-role dashboard analytics, the Google Meet link generator, and most AI endpoints (extract,
 * similarity check, semantic search, reviewer suggestions, feedback) have no real backend
 * implementation yet, so they're always mocked in development. Auth, notifications, research
 * types, and AI proposal summaries have real backend support, so they only mock when
 * USE_MOCK_API is on — otherwise they hit the real backend, and unmatched real requests simply
 * bypass MSW (see main.tsx).
 */
export const handlers = [
  ...analyticsHandlers,
  ...googleMeetHandlers,
  ...aiHandlers,
  ...(USE_MOCK_API ? authHandlers : []),
  ...(USE_MOCK_API ? notificationHandlers : []),
  ...(USE_MOCK_API ? researchTypeHandlers : []),
  ...(USE_MOCK_API ? aiSummaryHandlers : []),
  ...(USE_MOCK_API ? adminHandlers : []),
];
