import { prisma } from "../database/prisma";
import { OrderRepository } from "../repositories/OrderRepository";
import { CreateOrderDTO } from "../dtos/order/CreateOrderDTO";
import { AcceptOrderDTO } from "../dtos/order/AcceptOrderDTO";

type Role = "CLIENT" | "SUPPLIER" | "ADMIN";

export class OrderService {
  private readonly orderRepository = new OrderRepository();

  async createOrder(
    auth: { user_id: string; role: string },
    dto: CreateOrderDTO
  ) {
    // Apenas CLIENT
    if (auth.role !== "CLIENT") {
      return {
        status: 403,
        body: { message: "Apenas clientes podem criar pedidos." },
      };
    }

    // Validar fornecedor
    const supplier = await prisma.user.findFirst({
      where: {
        user_id: dto.supplier_id,
        role: "SUPPLIER",
        deleted_at: null,
        supplier_info: {
          is: { is_active: true },
        },
      },
    });

    if (!supplier) {
      return {
        status: 404,
        body: { message: "Fornecedor não encontrado ou inativo." },
      };
    }

    // Resolver endereço
    let address_id: string | null = null;

    if (dto.delivery_type === "DELIVERY") {
      if (dto.address_id) {
        const address = await prisma.address.findFirst({
          where: {
            address_id: dto.address_id,
            user_id: auth.user_id,
          },
        });

        if (!address) {
          return {
            status: 400,
            body: { message: "Endereço inválido ou não pertence ao cliente." },
          };
        }

        address_id = address.address_id;
      } else {
        const defaultAddress = await prisma.address.findFirst({
          where: {
            user_id: auth.user_id,
            is_default: true,
          },
        });

        if (!defaultAddress) {
          return {
            status: 400,
            body: {
              message:
                "Para DELIVERY é necessário informar um endereço ou definir um endereço padrão.",
            },
          };
        }

        address_id = defaultAddress.address_id;
      }
    }

    // Criar pedido
    const order = await this.orderRepository.create({
      client_id: auth.user_id,
      supplier_id: dto.supplier_id,
      delivery_type: dto.delivery_type,
      address_id,
      notes: dto.notes,
    });

    return {
      status: 201,
      body: {
        message: "Pedido criado com sucesso.",
        order,
        status_label: "aguardando confirmação",
      },
    };
  }

   async acceptOrder(
    auth: { user_id: string; role: string },
    order_id: string,
    dto: AcceptOrderDTO
  ) {
    // 1️⃣ Só SUPPLIER
    if (auth.role !== "SUPPLIER") {
      return {
        status: 403,
        body: { message: "Apenas fornecedores podem aceitar pedidos." },
      };
    }

    // Pedido existe?
    const order = await this.orderRepository.findById(order_id);

    if (!order) {
      return {
        status: 404,
        body: { message: "Pedido não encontrado." },
      };
    }

    // Pedido pertence a esse fornecedor?
    if (order.supplier_id !== auth.user_id) {
      return {
        status: 403,
        body: { message: "Você não tem permissão para aceitar este pedido." },
      };
    }

    // Status precisa estar PENDING
    if (order.status !== "PENDING") {
      return {
        status: 400,
        body: {
          message: `Pedido não pode ser aceito pois está com status ${order.status}.`,
        },
      };
    }

    // Validar price
    if (dto.price !== undefined) {
      if (typeof dto.price !== "number" || Number.isNaN(dto.price) || dto.price <= 0) {
        return {
          status: 400,
          body: { message: "price deve ser um número maior que zero." },
        };
      }
    }

    const updated = await this.orderRepository.acceptOrder({
      order_id,
      price: dto.price,
    });

    return {
      status: 200,
      body: {
        message: "Pedido aceito com sucesso.",
        order: updated,
      },
    };
  }
}
