import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/constants/env";
import { tokenStorage } from "@/utils/storage";
import i18n from "@/i18n";
import type { ApiError } from "@/types/common";

/**
 * Hạn chờ cho lời gọi **AI** — dài hơn hẳn mức thường.
 *
 * Gemini đọc file thuyết minh rồi mới sinh nội dung: đo thật trên máy là **36 giây** cho tóm tắt
 * và **54 giây** cho góp ý. Hạn 15 giây mặc định cắt đứt TẤT CẢ các lời gọi đó — máy chủ vẫn chạy
 * xong bình thường và lưu kết quả, chỉ trình duyệt bỏ cuộc trước rồi báo lỗi. Đây chính là lỗi
 * "AI bên PI chạy lỗi" ở buổi demo 14/08.
 *
 * Không nâng hạn mặc định lên cho mọi lời gọi: màn hình bình thường mà treo một phút thì tệ hơn
 * là báo lỗi sớm. Chỉ những đường thật sự gọi mô hình mới dùng hạn này.
 */
export const AI_TIMEOUT_MS = 180_000;

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  // No hardcoded Content-Type here — axios already sets "application/json" automatically for
  // plain object bodies. A fixed default header was overriding that and breaking multipart
  // FormData uploads (confirmed live: file uploads got 415 Unsupported Media Type because the
  // request still carried "application/json" instead of the correct multipart boundary).
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

interface ServerError {
  message?: string | null;
  errors?: string[] | null;
  errorCode?: string | null;
  details?: Record<string, unknown> | null;
}

/**
 * Chọn câu chữ hiện cho người dùng, theo thứ tự ưu tiên:
 *
 * 1. **Bảng dịch theo `errorCode`** — ngôn ngữ thuộc về giao diện, không thuộc máy chủ. Người dùng
 *    bật tiếng Anh thì lỗi cũng phải ra tiếng Anh.
 * 2. **Câu chữ máy chủ gửi kèm** — phương án dự phòng cho mã chưa dịch. Nhờ nó mà chuyển sang mã
 *    lỗi được làm **từng phần**, không phải dịch xong 71 mã mới dám bật.
 * 3. Câu chung theo mã HTTP — khi máy chủ chết hẳn, không trả nổi thân phản hồi.
 */
function resolveMessage(status: number, data?: ServerError): string {
  if (data?.errorCode) {
    const translated = i18n.t(`errors.${data.errorCode}`, {
      defaultValue: "",
      ...(data.details ?? {}),
    });
    if (translated) return translated;
  }
  return data?.message || data?.errors?.[0] || mapStatusToMessage(status);
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ServerError>) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;

    const apiError: ApiError = {
      status,
      message: resolveMessage(status, data),
      errors: data?.errors ?? undefined,
      errorCode: data?.errorCode ?? undefined,
      details: data?.details ?? undefined,
    };

    // 401 = chưa/hết đăng nhập ⇒ đá về màn đăng nhập. Đây là lý do máy chủ KHÔNG được dùng 401 cho
    // lỗi "sai mật khẩu hiện tại" khi đổi mật khẩu: người dùng đang đăng nhập hợp lệ, gõ nhầm một
    // ô mà bị đăng xuất thì vô lý (đã từng xảy ra thật, nay máy chủ trả 400 cho ca đó).
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
      return i18n.t("errors.HTTP_400");
    case 401:
      return i18n.t("errors.HTTP_401");
    case 403:
      return i18n.t("errors.HTTP_403");
    case 404:
      return i18n.t("errors.HTTP_404");
    case 0:
      return i18n.t("errors.HTTP_0");
    default:
      return i18n.t("errors.HTTP_UNKNOWN");
  }
}
