import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Create Axios instance — base URL per API Contract §1
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5068/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor ────────────────────────────────────────────
// Inject JWT Bearer token on every request (API Contract §1: JWT Bearer auth)
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Refresh Token Logic ────────────────────────────────────────────
// Per API Contract §15 note 9: call /auth/refresh when 401, retry with new token.
// Queue concurrent requests during refresh to avoid race conditions.

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and if we haven't already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If this is the refresh endpoint itself failing, don't recurse
    if (originalRequest.url?.includes("/auth/refresh")) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Call refresh endpoint (API Contract §3)
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken }
      );

      if (data.success && data.data) {
        const { accessToken, refreshToken: newRefreshToken, user } = data.data;

        // Update store with new tokens
        useAuthStore.getState().setAuth({
          user: user || useAuthStore.getState().user,
          token: accessToken,
          refreshToken: newRefreshToken || refreshToken,
        });

        // Process queued requests with new token
        processQueue(null, accessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      }

      throw new Error("Refresh token response invalid");
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Initialize Mock API ────────────────────────────────────────────
if (import.meta.env.VITE_API_MODE === "mock") {
  console.log("Mock API Mode Enabled");
  import("../mocks/setupMocks").then(({ setupMocks }) => {
    setupMocks(api);
  });
}