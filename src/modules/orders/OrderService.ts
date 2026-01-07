import { OrderRepository } from './OrderRepository';
import { prisma } from '../../prisma/client';
import { delivery_type } from '@prisma/client';

interface CreateOrderInput {
  client_id: string;
  supplier_id: string;
  delivery_type: delivery_type;
  address_id?: string;
  notes?: string;
}

export class OrderService {
  private orderRepository = new OrderRepository();

  async create(data: CreateOrderInput) {
    // 1️⃣ Verifica se fornecedor existe e é SUPPLIER
    const supplier = await prisma.user.findUnique({
      where: { user_id: data.supplier_id },
    });

    if (!supplier || supplier.role !== 'SUPPLIER') {
      throw new Error('Fornecedor inválido');
    }

    // 2️⃣ (Opcional) Verificar endereço pertence ao cliente
    if (data.address_id) {
      const address = await prisma.address.findFirst({
        where: {
          address_id: data.address_id,
          user_id: data.client_id,
        },
      });

      if (!address) {
        throw new Error('Endereço inválido');
      }
    }

    // 3️⃣ Criar pedido
    return this.orderRepository.create(data);
  }
}
