import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/constants/env";
import { tokenStorage } from "@/utils/storage";
import type { ApiError } from "@/types/common";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;

export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListener = listener;
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | null; errors?: string[] | null }>) => {
    const status = error.response?.status ?? 0;

    const apiError: ApiError = {
      status,
      message: error.response?.data?.message || error.response?.data?.errors?.[0] || mapStatusToMessage(status),
      errors: error.response?.data?.errors ?? undefined,
    };

    if (status === 401) {
      tokenStorage.clear();
      unauthorizedListener?.();
    }

    return Promise.reject(apiError);
  }
);

function mapStatusToMessage(status: number): string {
  switch (status) {
    case 400:
      return "The request could not be processed. Please check your input.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 0:
      return "Unable to reach the server. Please check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}
