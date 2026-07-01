import { USE_MOCK_API } from "@/constants/env";
import { authHandlers } from "@/mock/handlers/auth.handlers";
import { notificationHandlers } from "@/mock/handlers/notification.handlers";
import { analyticsHandlers } from "@/mock/handlers/analytics.handlers";

/**
 * Notifications and dashboard analytics have no real backend implementation yet, so they're
 * always mocked in development. Auth only mocks when USE_MOCK_API is on — otherwise it hits
 * the real backend, and unmatched real requests simply bypass MSW (see main.tsx).
 */
export const handlers = [...notificationHandlers, ...analyticsHandlers, ...(USE_MOCK_API ? authHandlers : [])];
