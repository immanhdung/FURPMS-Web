import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * FURPMS Utility Functions
 * Shared formatters, date helpers, and utility functions
 * used throughout the application.
 */

// ─── Classname Merge Helper (existing) ──────────────────────────────

/**
 * Merge Tailwind class names with conflict resolution.
 * @param  {...any} inputs - class names, arrays, or conditional objects
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── Currency & Number Formatting ────────────────────────────────────

/**
 * Format a number as Vietnamese Dong (VND) currency.
 * @param {number} amount - The amount in VND
 * @returns {string} Formatted string, e.g. "120.000.000 ₫"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

/**
 * Format a number with Vietnamese locale grouping.
 * @param {number} value
 * @returns {string} e.g. "1.284"
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return "0";
  return new Intl.NumberFormat("vi-VN").format(value);
}

/**
 * Format a percentage value.
 * @param {number} value - 0-100
 * @param {number} decimals - number of decimal places (default 1)
 * @returns {string} e.g. "82,5%"
 */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return "0%";
  return (
    new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + "%"
  );
}

// ─── Date & Time Formatting ─────────────────────────────────────────

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Format an ISO 8601 UTC date string to Vietnamese display format.
 * API sends UTC with "Z" suffix; we convert to UTC+7 for display.
 * @param {string} isoString - ISO 8601 date string (e.g. "2026-03-22T07:00:00Z")
 * @param {object} options - Intl.DateTimeFormat options override
 * @returns {string} e.g. "22/03/2026"
 */
export function formatDate(isoString, options = {}) {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: VN_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...options,
    }).format(date);
  } catch {
    return "—";
  }
}

/**
 * Format a date with time in Vietnamese timezone.
 * @param {string} isoString
 * @returns {string} e.g. "22/03/2026 14:00"
 */
export function formatDateTime(isoString) {
  return formatDate(isoString, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format an ISO date as relative time in Vietnamese.
 * @param {string} isoString
 * @returns {string} e.g. "2 giờ trước", "3 ngày trước"
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const now = Date.now();
  const date = new Date(isoString).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} tuần trước`;
  return formatDate(isoString);
}

// ─── Idempotency Key ────────────────────────────────────────────────

/**
 * Generate a cryptographically random UUID for use as an Idempotency-Key header.
 * Required for disbursement confirm and settlement sign endpoints.
 * @returns {string} UUID v4
 */
export function generateIdempotencyKey() {
  return crypto.randomUUID();
}

// ─── Status Configurations ──────────────────────────────────────────

const STATUS_MAP = {
  // Proposal statuses (§6 API Contract)
  proposal: {
    DRAFT: { label: "Bản nháp", color: "bg-gray-100 text-gray-700", icon: "📝" },
    SUBMITTED: { label: "Đã nộp", color: "bg-blue-100 text-blue-700", icon: "📤" },
    UNDER_REVIEW: { label: "Đang xét duyệt", color: "bg-orange-100 text-orange-700", icon: "🔍" },
    REVISION_REQUESTED: { label: "Yêu cầu chỉnh sửa", color: "bg-amber-100 text-amber-700", icon: "✏️" },
    APPROVED: { label: "Đã duyệt", color: "bg-green-100 text-green-700", icon: "✅" },
    REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-700", icon: "❌" },
    WITHDRAWN: { label: "Đã rút", color: "bg-gray-100 text-gray-500", icon: "↩️" },
  },
  // Cycle statuses (§5.1 API Contract)
  cycle: {
    PLANNING: { label: "Đang lên kế hoạch", color: "bg-gray-100 text-gray-700", icon: "📋" },
    OPEN: { label: "Đang mở", color: "bg-green-100 text-green-700", icon: "🟢" },
    REVIEWING: { label: "Đang xét duyệt", color: "bg-orange-100 text-orange-700", icon: "🔍" },
    CLOSED: { label: "Đã đóng", color: "bg-red-100 text-red-700", icon: "🔒" },
    ARCHIVED: { label: "Lưu trữ", color: "bg-gray-100 text-gray-500", icon: "🗄️" },
  },
  // Council statuses (§8.3 API Contract)
  council: {
    FORMING: { label: "Đang thành lập", color: "bg-gray-100 text-gray-700", icon: "🔧" },
    READY: { label: "Sẵn sàng", color: "bg-blue-100 text-blue-700", icon: "✔️" },
    IN_MEETING: { label: "Đang họp", color: "bg-orange-100 text-orange-700", icon: "🏛️" },
    DECIDED: { label: "Đã quyết định", color: "bg-green-100 text-green-700", icon: "⚖️" },
    CLOSED: { label: "Đã đóng", color: "bg-gray-100 text-gray-500", icon: "🔒" },
  },
  // Council member statuses (§2.5 API Contract)
  councilMember: {
    INVITED: { label: "Đã mời", color: "bg-blue-100 text-blue-700", icon: "📧" },
    ACCEPTED: { label: "Chấp nhận", color: "bg-green-100 text-green-700", icon: "✅" },
    DECLINED: { label: "Từ chối", color: "bg-red-100 text-red-700", icon: "❌" },
  },
  // Contract statuses (§9.1 API Contract)
  contract: {
    PENDING_SIGNATURE: { label: "Chờ ký", color: "bg-amber-100 text-amber-700", icon: "✍️" },
    ACTIVE: { label: "Đang thực hiện", color: "bg-green-100 text-green-700", icon: "🟢" },
    EXTENDED: { label: "Đã gia hạn", color: "bg-blue-100 text-blue-700", icon: "⏰" },
    COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800", icon: "🏁" },
    TERMINATED: { label: "Chấm dứt", color: "bg-red-100 text-red-700", icon: "🛑" },
  },
  // Disbursement statuses (§9.2 API Contract)
  disbursement: {
    PENDING: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-700", icon: "⏳" },
    CONDITION_MET: { label: "Đủ điều kiện", color: "bg-blue-100 text-blue-700", icon: "✔️" },
    PROCESSING: { label: "Đang xử lý", color: "bg-orange-100 text-orange-700", icon: "🔄" },
    DISBURSED: { label: "Đã giải ngân", color: "bg-green-100 text-green-700", icon: "💰" },
    FAILED: { label: "Thất bại", color: "bg-red-100 text-red-700", icon: "❌" },
  },
  // Review round statuses (§8.1 API Contract)
  reviewRound: {
    PENDING: { label: "Chờ mở", color: "bg-gray-100 text-gray-700", icon: "⏳" },
    OPEN: { label: "Đang mở", color: "bg-green-100 text-green-700", icon: "🟢" },
    PASSED: { label: "Đạt", color: "bg-green-100 text-green-800", icon: "✅" },
    FAILED: { label: "Không đạt", color: "bg-red-100 text-red-700", icon: "❌" },
  },
  // Deliverable statuses (§9.3 API Contract)
  deliverable: {
    PENDING: { label: "Chờ nộp", color: "bg-gray-100 text-gray-700", icon: "⏳" },
    PASSED: { label: "Đạt", color: "bg-green-100 text-green-700", icon: "✅" },
    FAILED: { label: "Không đạt", color: "bg-red-100 text-red-700", icon: "❌" },
  },
  // Amendment statuses (§9.4 API Contract)
  amendment: {
    PENDING: { label: "Chờ xét duyệt", color: "bg-gray-100 text-gray-700", icon: "⏳" },
    UNDER_REVIEW: { label: "Đang xét duyệt", color: "bg-orange-100 text-orange-700", icon: "🔍" },
    APPROVED: { label: "Đã duyệt", color: "bg-green-100 text-green-700", icon: "✅" },
    REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-700", icon: "❌" },
  },
  // Progress report statuses (§9.5 API Contract)
  progressReport: {
    DRAFT: { label: "Bản nháp", color: "bg-gray-100 text-gray-700", icon: "📝" },
    SUBMITTED: { label: "Đã nộp", color: "bg-blue-100 text-blue-700", icon: "📤" },
    PASSED: { label: "Đạt", color: "bg-green-100 text-green-700", icon: "✅" },
    FAILED: { label: "Không đạt", color: "bg-red-100 text-red-700", icon: "❌" },
  },
  // Final report statuses (§9.7 API Contract)
  finalReport: {
    DRAFT: { label: "Bản nháp", color: "bg-gray-100 text-gray-700", icon: "📝" },
    SUBMITTED: { label: "Đã nộp", color: "bg-blue-100 text-blue-700", icon: "📤" },
    REVISION_REQUESTED: { label: "Yêu cầu sửa", color: "bg-amber-100 text-amber-700", icon: "✏️" },
    ACCEPTED: { label: "Chấp nhận", color: "bg-green-100 text-green-700", icon: "✅" },
    ARCHIVED: { label: "Lưu trữ", color: "bg-gray-100 text-gray-500", icon: "🗄️" },
  },
};

const FALLBACK_STATUS = { label: "Không xác định", color: "bg-gray-100 text-gray-500", icon: "❓" };

/**
 * Get status display configuration by entity type and status code.
 * @param {string} entityType - e.g. "proposal", "contract", "disbursement"
 * @param {string} status - e.g. "DRAFT", "APPROVED", "ACTIVE"
 * @returns {{ label: string, color: string, icon: string }}
 */
export function getStatusConfig(entityType, status) {
  return STATUS_MAP[entityType]?.[status] || FALLBACK_STATUS;
}

// ─── Role Helpers ───────────────────────────────────────────────────

const ROLE_LABELS = {
  Admin: "Quản trị viên",
  Staff: "Nhân viên QLKH",
  Faculty: "Giảng viên",
  ReviewCommittee: "Ủy viên Hội đồng",
};

/**
 * Get Vietnamese label for a role code.
 * @param {string} roleCode
 * @returns {string}
 */
export function getRoleLabel(roleCode) {
  return ROLE_LABELS[roleCode] || roleCode;
}

/**
 * Check if user has any of the specified roles.
 * @param {object} user - User object from auth store
 * @param {string[]} roles - Array of role codes to check
 * @returns {boolean}
 */
export function hasRole(user, roles) {
  if (!user?.roles) return false;
  return user.roles.some((r) => roles.includes(r));
}
