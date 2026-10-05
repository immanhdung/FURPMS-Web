export interface Track {
  id: number;
  name: string;
  description?: string | null;
  ownerId?: string | null;
  isActive: boolean;
  /**
   * Số đợt đang mở lĩnh vực này. Bằng 0 nghĩa là lĩnh vực đã tạo nhưng CHƯA đợt nào dùng — PI sẽ
   * không thấy nó khi nộp đề cương.
   */
  cycleCount?: number;
}

export interface CreateTrackPayload {
  name: string;
  description?: string;
  ownerId?: string;
}

export interface UpdateTrackPayload {
  name?: string;
  description?: string;
  ownerId?: string | null;
}
