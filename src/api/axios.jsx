import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Create Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5068/api/v1",
  timeout: 10000,
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry / unauth
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // TODO: Handle token refresh logic here
      // For now, logout user
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Initialize mock if in mock mode
if (import.meta.env.VITE_API_MODE === "mock") {
  console.log("Mock API Mode Enabled");
  import("../mocks/setupMocks").then(({ setupMocks }) => {
    setupMocks(api);
  });
}