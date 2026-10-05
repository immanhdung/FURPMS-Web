/**
 * Thông tin định danh Bên B để điền hợp đồng (C3).
 * Số đầy đủ KHÔNG bao giờ được trả về — chỉ có bản đã che (`****1234`); số thật chỉ xuất hiện
 * trong file Word hợp đồng do máy chủ sinh ra.
 */
export interface ContractIdentity {
  bankAccountNumberMasked: string | null;
  bankName: string | null;
  nationalIdMasked: string | null;
  nationalIdIssuedDate: string | null;
  nationalIdIssuedPlace: string | null;
  hasBankAccount: boolean;
  hasNationalId: boolean;
  /** Còn thiếu gì so với mẫu BM05 — chỉ để nhắc, không chặn lập hợp đồng. */
  missingForContract: string[];
}

export interface ContractIdentityPayload {
  bankAccountNumber?: string;
  bankName?: string;
  nationalId?: string;
  nationalIdIssuedDate?: string | null;
  nationalIdIssuedPlace?: string;
}
