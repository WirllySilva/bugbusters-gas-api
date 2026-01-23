import { prisma } from "../database/prisma";
import { AlertType, Prisma } from "@prisma/client";

type AlertMetadata = Prisma.JsonValue;

export class AlertRepository {
  async create(data: {
    user_id: string;
    type: AlertType;
    message: string;
    metadata?: AlertMetadata;
  }) {
    return prisma.alert.create({
      data: {
        user_id: data.user_id,
        type: data.type,
        message: data.message,
        metadata: data.metadata ?? undefined,
      },
    });
  }

  async listAllByUser(user_id: string) {
    return prisma.alert.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" },
    });
  }

  async listByType(user_id: string, type: AlertType) {
    return prisma.alert.findMany({
      where: { user_id, type },
      orderBy: { created_at: "desc" },
    });
  }

  // Evitar spam: não cria o mesmo alerta repetido dentro da janela
  async hasRecentAlert(user_id: string, type: AlertType, minutes: number) {
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const found = await prisma.alert.findFirst({
      where: {
        user_id,
        type,
        created_at: { gte: since },
      },
      select: { alert_id: true },
    });

    return Boolean(found);
  }

  async markHandled(alert_id: string, handled: boolean) {
    return prisma.alert.update({
      where: { alert_id },
      data: { handled },
    });
  }
}
