/** Cấu hình vận hành do Admin chỉnh trong app (bảng `system_settings` bên BE). */
export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  /** Mức khuyến cáo — hiện kèm để Admin biết đâu là giá trị chuẩn. */
  recommendedValue: string;
  description?: string | null;
  updatedAt: string;
}

/** Giới hạn upload hiện hành — mọi user đọc được để validate trước khi gửi file. */
export interface UploadPolicy {
  maxFileSizeMb: number;
  recommendedMaxFileSizeMb: number;
  minAllowedMb: number;
  maxAllowedMb: number;
  allowedExtensions: string[];
}

export const SYSTEM_SETTING_KEYS = {
  UPLOAD_MAX_FILE_SIZE_MB: "UPLOAD_MAX_FILE_SIZE_MB",
  UPLOAD_ALLOWED_EXTENSIONS: "UPLOAD_ALLOWED_EXTENSIONS",
} as const;
