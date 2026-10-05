export interface Contract {
  id: string;
  proposalId: string;
  /**
   * Đề tài gốc. Kinh phí, quyết định, dòng thời gian đều gắn với ĐỀ TÀI chứ không phải bản đề
   * cương (đề cương sửa thành v2 thì id đổi, đề tài thì không). BE vẫn luôn trả trường này.
   */
  projectId?: string | null;
  /** Tên đề tài do BE trả kèm — dùng thẳng, đừng tra ngược từ danh sách đề cương. */
  proposalTitle?: string | null;
  piName?: string | null;
  researchTypeId?: number;
  researchTypeCode?: string | null;
  researchTypeName?: string | null;
  cycleId?: number;
  cycleCode?: string | null;
  trackId?: number;
  trackCode?: string | null;
  trackName?: string | null;
  contractNumber?: string | null;
  scopeTitle?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  /** Hạn GỐC lúc ký — khác endDate nghĩa là đã gia hạn. */
  originalEndDate?: string | null;
  maxExtensionMonths?: number | null;
  sideARepresentative?: string | null;
  econtractUrl?: string | null;
  status?: string | null;
  /**
   * Giá trị hợp đồng (VNĐ) — máy chủ chép từ dự toán được duyệt lúc tạo hợp đồng, không sửa tay.
   *
   * Máy chủ trả trường này ở CẢ danh sách lẫn chi tiết từ lâu, nhưng kiểu ở đây thiếu nên
   * `grep totalAmount` toàn FE ra 0 kết quả ⇒ **số tiền của đề tài không hiện ở bất kỳ màn nào**.
   * Hội đồng bảo vệ lần 2 bắt đúng chỗ này ("cần thể hiện rõ ngân sách tương ứng cho các đề tài").
   * Đúng cái bẫy `AGENTS.md` §3.2: DTO chép tay, BE đổi thì FE không báo lỗi, màn hình chỉ lặng lẽ
   * hiện "-".
   */
  totalAmount?: number | null;
  /** Trạng thái đề tài: nghiệm thu Đạt = COMPLETED, tách biệt với thanh lý hợp đồng. */
  projectStatus?: string | null;
  terminatedAt?: string | null;
  terminatedReason?: string | null;
  createdAt?: string | null;
}

export interface TerminateContractPayload {
  reason: string;
}

export type UpdateContractPayload = Omit<CreateContractPayload, "proposalId">;

export interface CreateContractPayload {
  proposalId: string;
  contractNumber?: string;
  scopeTitle?: string;
  startDate: string;
  endDate: string;
  maxExtensionMonths: number;
  sideARepresentative?: string;
  econtractUrl?: string;
}
