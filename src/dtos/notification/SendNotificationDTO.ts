export type NotificationChannel = "WHATSAPP" | "PUSH";

export interface SendNotificationDTO {
  user_id: string;
  channel: NotificationChannel;

  template?: string;
  title?: string;
  message: string;
  payload?: Record<string, unknown>;
}
