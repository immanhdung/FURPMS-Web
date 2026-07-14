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
  link?: string;
}
