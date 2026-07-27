// Mặc định trỏ BE local (dotnet run :5068) khi thiếu .env — tránh clone về là hụt API (dùng .env để đổi).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5068/api";

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export const AUTH_TOKEN_STORAGE_KEY = "furpms_auth_token";
