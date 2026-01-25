import { NotificationChannel, NotificationStatus, status, Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { DeviceTokenRepository } from "../repositories/DeviceTokenRepository";
import { SendNotificationDTO } from "../dtos/notification/SendNotificationDTO";
import { WhatsAppProvider } from "./providers/WhatsAppProvider";
import { PushProvider } from "./providers/PushProvider";
import { MockWhatsAppProvider } from "./providers/MockWhatsAppProvider";
import { MockPushProvider } from "./providers/MockPushProvider";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

function toJsonValue(value: unknown): Prisma.JsonValue | undefined {
  // Se for undefined, mantém undefined (Prisma Json? aceita undefined para "não setar")
  if (value === undefined) return undefined;

  // Atenção: isto só faz cast de tipo para satisfazer TS.
  // Se você colocar Date / function etc, Prisma pode rejeitar em runtime.
  return value as Prisma.JsonValue;
}

export class NotificationService {
  private readonly notificationRepo = new NotificationRepository();
  private readonly deviceTokenRepo = new DeviceTokenRepository();

  private readonly whatsappProvider: WhatsAppProvider;
  private readonly pushProvider: PushProvider;

  constructor() {
    // mock 
    this.whatsappProvider = new MockWhatsAppProvider();
    this.pushProvider = new MockPushProvider();
  }

  async send(dto: SendNotificationDTO) {
    const user = await prisma.user.findUnique({
      where: { user_id: dto.user_id },
      select: { phone: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const providerName =
      dto.channel === "WHATSAPP"
        ? this.whatsappProvider.providerName
        : this.pushProvider.providerName;

    // 1) registra no banco como PENDING
    const notification = await this.notificationRepo.create({
      user_id: dto.user_id,
      channel: dto.channel as NotificationChannel, // se dto.channel já vem do Prisma enum, pode remover o cast
      template: dto.template ?? null,
      title: dto.title ?? null,
      message: dto.message,
      payload: toJsonValue(dto.payload),
      provider: providerName,
    });

    try {
      // 2) envia (mock no MVP)
      if (dto.channel === "WHATSAPP") {
        const resp = await this.whatsappProvider.send({
          to: user.phone,
          message: dto.message,
        });

        // 3) marca como enviado
        await this.notificationRepo.markSent(
          notification.notification_id,
          this.whatsappProvider.providerName,
          resp.external_id
        );

        return {
          notification_id: notification.notification_id,
          status: NotificationStatus.SENT,
          channel: NotificationChannel.WHATSAPP,
          payload_sent: { to: user.phone, message: dto.message },
        };
      }

      // PUSH
      const tokens = await this.deviceTokenRepo.getEnabledTokens(dto.user_id);
      const tokenValues = tokens.map((t) => t.token);

      if (tokenValues.length === 0) {
        // Sem token, consideramos falha no MVP
        await this.notificationRepo.markFailed(
          notification.notification_id,
          this.pushProvider.providerName,
          "No device token registered."
        );

        return {
          notification_id: notification.notification_id,
          status: NotificationStatus.FAILED,
          channel: NotificationChannel.PUSH,
          reason: "No device token registered.",
        };
      }

      const title = dto.title ?? "Notificação";
      const body = dto.message;

      const resp = await this.pushProvider.send({
        tokens: tokenValues,
        title,
        body,
        data: toJsonValue(dto.payload),
      });

      await this.notificationRepo.markSent(
        notification.notification_id,
        this.pushProvider.providerName,
        resp.external_id
      );

      return {
        notification_id: notification.notification_id,
        status: NotificationStatus.SENT,
        channel: NotificationChannel.PUSH,
        payload_sent: {
          tokens: tokenValues,
          title,
          body,
          data: toJsonValue(dto.payload),
        },
      };
    } catch (err: unknown) {
      const msg = getErrorMessage(err);

      await this.notificationRepo.markFailed(
        notification.notification_id,
        providerName,
        msg
      );

      return {
        notification_id: notification.notification_id,
        status: NotificationStatus.FAILED,
        channel: dto.channel as NotificationChannel,
        error: msg,
      };
    }
  }

  async notifyOrderCreated(data: {
    order_id: string;
    client_id: string;
    supplier_id: string;
  }) {
    // CLIENTE: pedido criado com sucesso
    const clientWhatsapp = await this.send({
      user_id: data.client_id,
      channel: "WHATSAPP",
      template: "ORDER_CREATED",
      message: `Pedido ${data.order_id} efetuado com sucesso.`,
      payload: { order_id: data.order_id, status: "PENDING" },
    });

    const clientPush = await this.send({
      user_id: data.client_id,
      channel: "PUSH",
      template: "ORDER_CREATED",
      title: "Pedido criado",
      message: `Pedido ${data.order_id} efetuado com sucesso.`,
      payload: { order_id: data.order_id, status: "PENDING" },
    });

    // FORNECEDOR: novo pedido recebido
    const supplierWhatsapp = await this.send({
      user_id: data.supplier_id,
      channel: "WHATSAPP",
      template: "SUPPLIER_NEW_ORDER",
      message: `Você recebeu um novo pedido: ${data.order_id}.`,
      payload: { order_id: data.order_id },
    });

    const supplierPush = await this.send({
      user_id: data.supplier_id,
      channel: "PUSH",
      template: "SUPPLIER_NEW_ORDER",
      title: "Novo pedido",
      message: `Você recebeu um novo pedido: ${data.order_id}.`,
      payload: { order_id: data.order_id },
    });

    return {
      client: { whatsapp: clientWhatsapp, push: clientPush },
      supplier: { whatsapp: supplierWhatsapp, push: supplierPush },
    };
  }

  async notifyOrderStatusToClient(data: {
    order_id: string;
    client_id: string;
    status: status;
  }) {
    const map: Record<status, { template: string; title: string; message: string }> = {
      PENDING: {
        template: "ORDER_PENDING",
        title: "Pedido pendente",
        message: `Seu pedido ${data.order_id} está pendente.`,
      },
      ACCEPTED: {
        template: "ORDER_ACCEPTED",
        title: "Pedido aceito",
        message: `Seu pedido ${data.order_id} foi aceito pelo fornecedor.`,
      },
      IN_TRANSIT: {
        template: "ORDER_IN_TRANSIT",
        title: "Pedido a caminho",
        message: `Seu pedido ${data.order_id} está em trânsito.`,
      },
      PICKED_UP: {
        template: "ORDER_STATUS_PICKED_UP",
        title: "Pedido retirado",
        message: "Seu pedido foi retirado com sucesso.",
      },
      DELIVERED: {
        template: "ORDER_DELIVERED",
        title: "Pedido entregue",
        message: `Seu pedido ${data.order_id} foi entregue.`,
      },
      CANCELLED: {
        template: "ORDER_CANCELLED",
        title: "Pedido cancelado",
        message: `Seu pedido ${data.order_id} foi cancelado.`,
      },
    };

    const item = map[data.status];

    const whatsapp = await this.send({
      user_id: data.client_id,
      channel: "WHATSAPP",
      template: item.template,
      message: item.message,
      payload: { order_id: data.order_id, status: data.status },
    });

    const push = await this.send({
      user_id: data.client_id,
      channel: "PUSH",
      template: item.template,
      title: item.title,
      message: item.message,
      payload: { order_id: data.order_id, status: data.status },
    });

    return { whatsapp, push };
  }

}
