export type NotificationType =
  | "PROPOSAL"
  | "REVIEW"
  | "COUNCIL"
  | "MEETING"
  | "CONTRACT"
  | "SYSTEM";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/** DTO trả về trực tiếp từ NotificationsController của backend. */
export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

export interface NotificationCount {
  unread: number;
  total: number;
}
