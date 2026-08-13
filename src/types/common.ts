/**
 * BE có 2 dạng: `ApiResponse<T>` (có data) và `ApiResponse` trần (chỉ message) — xem
 * `FURPMS.Application/Common/ApiResponse.cs`. Mặc định `T = null` để FE viết được cả hai.
 */
export interface ApiResponse<T = null> {
  success: boolean;
  message?: string | null;
  data: T;
  errors?: string[] | null;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  /** Câu chữ đã sẵn sàng hiện cho người dùng — đã qua bảng dịch nếu máy chủ có gửi `errorCode`. */
  message: string;
  errors?: string[];
  /**
   * Mã lỗi ổn định từ máy chủ (`AUTH_INVALID_CREDENTIALS`, `BUDGET_CAP_EXCEEDED`…).
   *
   * Dùng khi cần **phản ứng theo loại lỗi** chứ không chỉ hiện chữ — vd đang ở màn ký hợp đồng mà
   * gặp `CONTRACT_NEEDS_SIGNED_COPY` thì mở luôn hộp thoại tải file lên. So khớp bằng mã thay vì
   * bằng chuỗi chữ, nên sửa câu chữ không làm gãy chỗ nào.
   */
  errorCode?: string;
  /** Dữ liệu kèm theo để ghép câu (trần kinh phí, số phiếu còn thiếu…). */
  details?: Record<string, unknown>;
}
