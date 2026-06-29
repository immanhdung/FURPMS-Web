/**
 * System Settings Mock Data (Sprint 4)
 * Cycles, Tracks, and 7 Lookup tables.
 */

// ─── 1. Cycles & Tracks ─────────────────────────────────────────────

export const mockTracks = [
  { id: 1, name: "Nghiên cứu cơ bản", ownerId: "u-004", ownerName: "PGS. Trần Quốc Bình", isActive: true },
  { id: 2, name: "Nghiên cứu ứng dụng", ownerId: "u-010", ownerName: "Đào Trọng Khoa", isActive: true },
  { id: 3, name: "Nghiên cứu liên ngành", ownerId: null, ownerName: null, isActive: true },
  { id: 4, name: "Phục vụ cộng đồng", ownerId: null, ownerName: null, isActive: false },
];

export const mockCyclesList = [
  {
    id: 1,
    name: "Đợt tài trợ Mùa Xuân 2026",
    year: 2026,
    description: "Tập trung vào các đề tài AI ứng dụng và phát triển bền vững.",
    researchTypeId: 2, // Ứng dụng
    status: "OPEN",
    submissionDeadline: "2026-08-30T23:59:59Z",
    reviewDeadline: "2026-09-30T23:59:59Z",
    proposalCount: 15,
    totalFunding: 1500000000,
    tracks: [mockTracks[0], mockTracks[1]],
  },
  {
    id: 2,
    name: "Đợt tài trợ Cơ bản 2026",
    year: 2026,
    description: "Dành cho các nghiên cứu lý thuyết chuyên sâu.",
    researchTypeId: 1, // Cơ bản
    status: "PLANNING",
    submissionDeadline: "2026-10-15T23:59:59Z",
    reviewDeadline: "2026-11-15T23:59:59Z",
    proposalCount: 0,
    totalFunding: 0,
    tracks: [mockTracks[0]],
  },
  {
    id: 3,
    name: "Đợt tài trợ Mùa Thu 2025",
    year: 2025,
    description: "Đợt tài trợ liên ngành và khoa học xã hội.",
    researchTypeId: 3, // Liên ngành
    status: "REVIEWING",
    submissionDeadline: "2025-08-30T23:59:59Z",
    reviewDeadline: "2025-10-15T23:59:59Z",
    proposalCount: 24,
    totalFunding: 2800000000,
    tracks: [mockTracks[2]],
  },
  {
    id: 4,
    name: "Đợt tài trợ Mùa Xuân 2025",
    year: 2025,
    description: "Các dự án phục vụ cộng đồng và sinh viên.",
    researchTypeId: 4, // Cộng đồng
    status: "CLOSED",
    submissionDeadline: "2025-02-28T23:59:59Z",
    reviewDeadline: "2025-04-30T23:59:59Z",
    proposalCount: 12,
    totalFunding: 1200000000,
    tracks: [mockTracks[3]],
  },
  {
    id: 5,
    name: "Đợt tài trợ 2024",
    year: 2024,
    description: "Lưu trữ.",
    researchTypeId: 1,
    status: "ARCHIVED",
    submissionDeadline: "2024-06-30T23:59:59Z",
    reviewDeadline: "2024-08-30T23:59:59Z",
    proposalCount: 45,
    totalFunding: 5500000000,
    tracks: [mockTracks[0], mockTracks[1]],
  },
];

// ─── 2. Lookup Tables ───────────────────────────────────────────────

export const mockBudgetCategories = [
  { id: 1, code: "NS", name: "Nhân sự", isActive: true },
  { id: 2, code: "TB", name: "Thiết bị, máy móc", isActive: true },
  { id: 3, code: "NL", name: "Nguyên vật liệu", isActive: true },
  { id: 4, code: "CT", name: "Công tác phí", isActive: true },
  { id: 5, code: "K", name: "Chi phí khác", isActive: true },
];

export const mockFinancialConfigs = [
  { id: 1, code: "MAX_BUDGET_BASIC", name: "Ngân sách tối đa (Cơ bản)", value: "100000000", isActive: true },
  { id: 2, code: "MAX_BUDGET_APP", name: "Ngân sách tối đa (Ứng dụng)", value: "200000000", isActive: true },
  { id: 3, code: "VAT_RATE", name: "Tỷ lệ VAT (%)", value: "10", isActive: true },
];

export const mockPersonnelRoles = [
  { id: 1, code: "PI", name: "Chủ nhiệm đề tài", isActive: true },
  { id: 2, code: "MEMBER", name: "Thành viên nghiên cứu", isActive: true },
  { id: 3, code: "SEC", name: "Thư ký khoa học", isActive: true },
  { id: 4, code: "TECH", name: "Kỹ thuật viên", isActive: true },
];

export const mockProductCategories = [
  { id: 1, code: "PUB_Q1", name: "Bài báo ISI/Scopus Q1", isActive: true },
  { id: 2, code: "PUB_Q2", name: "Bài báo ISI/Scopus Q2", isActive: true },
  { id: 3, code: "PATENT", name: "Bằng độc quyền sáng chế", isActive: true },
  { id: 4, code: "SOFT", name: "Phần mềm/Mã nguồn", isActive: true },
  { id: 5, code: "BOOK", name: "Sách chuyên khảo", isActive: false },
];

export const mockRubricCriteria = [
  { id: 1, code: "R1_INNOVATION", name: "Tính mới và sáng tạo", max_score: 25, isActive: true },
  { id: 2, code: "R1_METHOD", name: "Phương pháp nghiên cứu", max_score: 25, isActive: true },
  { id: 3, code: "R1_FEASIBILITY", name: "Tính khả thi", max_score: 25, isActive: true },
  { id: 4, code: "R1_IMPACT", name: "Hiệu quả dự kiến", max_score: 25, isActive: true },
];

export const mockAmendmentCategories = [
  { id: 1, code: "BUDGET_SHIFT", name: "Điều chỉnh kinh phí", isActive: true },
  { id: 2, code: "PERSONNEL", name: "Thay đổi nhân sự", isActive: true },
  { id: 3, code: "EXTENSION", name: "Gia hạn thời gian", isActive: true },
  { id: 4, code: "SCOPE", name: "Thay đổi mục tiêu/nội dung", isActive: true },
];
