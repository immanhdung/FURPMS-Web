import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/env";
import { MOCK_ACCOUNTS } from "@/mock/data/users";
import type { ApiResponse } from "@/types/common";
import type { LoginRequest, LoginResponse, User } from "@/types/auth";

const MOCK_TOKEN_PREFIX = "mock-jwt-token-for-";

export const authHandlers = [
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    const account = MOCK_ACCOUNTS.find(
      (a) => a.user.email.toLowerCase() === body.email?.toLowerCase() && a.password === body.password
    );

    if (!account) {
      return HttpResponse.json<ApiResponse<null>>(
        { success: false, message: "Invalid email or password.", data: null, errors: ["Invalid email or password."] },
        { status: 401 }
      );
    }

    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        accessToken: `${MOCK_TOKEN_PREFIX}${account.user.id}`,
        tokenType: "Bearer",
        expiresIn: 3600,
        user: account.user,
      },
    };

    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const account = MOCK_ACCOUNTS.find((a) => token === `${MOCK_TOKEN_PREFIX}${a.user.id}`);

    if (!account) {
      return HttpResponse.json<ApiResponse<null>>(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const response: ApiResponse<User> = { success: true, data: account.user };
    return HttpResponse.json(response);
  }),

  http.post(`${API_BASE_URL}/auth/change-password`, () => {
    const response: ApiResponse<null> = { success: true, data: null };
    return HttpResponse.json(response);
  }),
];
