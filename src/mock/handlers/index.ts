import { USE_MOCK_API } from "@/constants/env";
import { authHandlers } from "@/mock/handlers/auth.handlers";
import { notificationHandlers } from "@/mock/handlers/notification.handlers";
import { analyticsHandlers } from "@/mock/handlers/analytics.handlers";
import { researchTypeHandlers } from "@/mock/handlers/research-type.handlers";

/**
 * Notifications, dashboard analytics, and research types have no real backend implementation
 * we're wiring up yet, so they're always mocked in development. Auth only mocks when
 * USE_MOCK_API is on — otherwise it hits the real backend, and unmatched real requests simply
 * bypass MSW (see main.tsx).
 */
export const handlers = [
  ...notificationHandlers,
  ...analyticsHandlers,
  ...researchTypeHandlers,
  ...(USE_MOCK_API ? authHandlers : []),
];
