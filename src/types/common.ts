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
  message: string;
  errors?: string[];
}
