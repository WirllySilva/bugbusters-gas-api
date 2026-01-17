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
}
