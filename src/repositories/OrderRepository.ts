import { prisma } from "../database/prisma";

export class OrderRepository {
  async create(data: {
    client_id: string;
    supplier_id: string;
    delivery_type: "DELIVERY" | "PICKUP";
    address_id: string | null;
    notes?: string | null;
  }) {
    return prisma.order.create({
      data: {
        client_id: data.client_id,
        supplier_id: data.supplier_id,
        delivery_type: data.delivery_type,
        address_id: data.address_id,
        notes: data.notes ?? null,
        status: "PENDING",
      },
    });
  }

  async findById(order_id: string) {
    return prisma.order.findUnique({
      where: { order_id },
    });
  }

  async acceptOrder(params: {
    order_id: string;
    price?: number;
  }) {
    return prisma.order.update({
      where: { order_id: params.order_id },
      data: {
        status: "ACCEPTED",
        price: params.price !== undefined ? params.price : undefined,
      },
    });
  }

  async list(params: {
    where: {
      client_id?: string;
      supplier_id?: string;
      status?: "PENDING" | "ACCEPTED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
    };
    take?: number;
    skip?: number;
  }) {
    return prisma.order.findMany({
      where: params.where,
      orderBy: { created_at: "desc" },
      take: params.take,
      skip: params.skip,
    });
  }

  async updateStatus(params: {
    order_id: string;
    status: "IN_TRANSIT" | "DELIVERED" |"PICKED_UP" | "CANCELLED";
    delivered_at?: Date | null;
  }) {
    return prisma.order.update({
      where: { order_id: params.order_id },
      data: {
        status: params.status,
        delivered_at: params.delivered_at === undefined ? undefined : params.delivered_at,
      },
    });
  }
}
