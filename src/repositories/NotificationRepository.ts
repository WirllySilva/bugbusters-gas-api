import { prisma } from "../database/prisma";
import { NotificationChannel, NotificationStatus, Prisma } from "@prisma/client";

type NotificationPayload = Prisma.JsonValue;

export class NotificationRepository {
  async create(data: {
    user_id: string;
    channel: NotificationChannel;
    template?: string | null;
    title?: string | null;
    message: string;
    payload?: NotificationPayload;
    provider?: string | null;
  }) {
    return prisma.notification.create({
      data: {
        user_id: data.user_id,
        channel: data.channel,
        template: data.template ?? null,
        title: data.title ?? null,
        message: data.message,
        payload: data.payload ?? undefined,
        provider: data.provider ?? null,
        status: NotificationStatus.PENDING,
      },
    });
  }

  async markSent(
    notification_id: string,
    provider: string,
    external_id?: string | null
  ) {
    return prisma.notification.update({
      where: { notification_id },
      data: {
        status: NotificationStatus.SENT,
        provider,
        external_id: external_id ?? null,
        sent_at: new Date(),
        error: null,
      },
    });
  }

  async markFailed(
    notification_id: string,
    provider: string,
    error: string
  ) {
    return prisma.notification.update({
      where: { notification_id },
      data: {
        status: NotificationStatus.FAILED,
        provider,
        error,
      },
    });
  }

  async listByUser(user_id: string, take = 20) {
    return prisma.notification.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" },
      take,
    });
  }
}
