import { prisma } from '../../prisma/client';
import { delivery_type, status } from '@prisma/client';

interface CreateOrderDTO {
  client_id: string;
  supplier_id: string;
  delivery_type: delivery_type;
  address_id?: string;
  notes?: string;
}

export class OrderRepository {
  async create(data: CreateOrderDTO) {
    return prisma.order.create({
      data: {
        client_id: data.client_id,
        supplier_id: data.supplier_id,
        address_id: data.address_id,
        delivery_type: data.delivery_type,
        notes: data.notes,
        status: status.PENDING, // 🔥 regra do projeto
      },
    });
  }
}
