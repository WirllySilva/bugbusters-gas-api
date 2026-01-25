import { prisma } from "../database/prisma";
import { OrderRepository } from "../repositories/OrderRepository";
import { CreateOrderDTO } from "../dtos/order/CreateOrderDTO";
import { AcceptOrderDTO } from "../dtos/order/AcceptOrderDTO";
import { UpdateOrderStatusDTO } from "../dtos/order/UpdateOrderStatusDTO";
import { ListOrdersQueryDTO } from "../dtos/order/ListOrdersQueryDTO";

// ✅ ADD
import { NotificationService } from "./NotificationService";

type Role = "CLIENT" | "SUPPLIER" | "ADMIN";
type Status = "PENDING" | "ACCEPTED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export class OrderService {
    private readonly orderRepository = new OrderRepository();

    // ✅ ADD
    private readonly notificationService = new NotificationService();

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

        // ✅ ADD: notifica CLIENTE + FORNECEDOR (não altera retorno, não altera regra)
        try {
            await this.notificationService.notifyOrderCreated({
                order_id: order.order_id,
                client_id: order.client_id,
                supplier_id: order.supplier_id,
            });
        } catch (err: unknown) {
            // não quebra o fluxo do pedido
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[OrderService] notifyOrderCreated failed: ${msg}`);
        }

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
        // Só SUPPLIER
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

        // ✅ ADD: notifica CLIENTE que foi aceito
        try {
            await this.notificationService.notifyOrderStatusToClient({
                order_id: updated.order_id,
                client_id: updated.client_id,
                status: updated.status as Status, // ACCEPTED
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[OrderService] notifyOrderStatusToClient(ACCEPTED) failed: ${msg}`);
        }

        return {
            status: 200,
            body: {
                message: "Pedido aceito com sucesso.",
                order: updated,
            },
        };
    }

    async listOrders(auth: { user_id: string; role: string }, query: ListOrdersQueryDTO) {
        const role = auth.role as Role;

        const take = query.take && query.take > 0 ? Math.min(query.take, 50) : 20;
        const skip = query.skip && query.skip >= 0 ? query.skip : 0;

        const where: {
            client_id?: string;
            supplier_id?: string;
            status?: "PENDING" | "ACCEPTED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
        } = {};

        if (query.status) where.status = query.status;

        if (role === "CLIENT") where.client_id = auth.user_id;
        else if (role === "SUPPLIER") where.supplier_id = auth.user_id;
        else {
            return { status: 403, body: { message: "Acesso não permitido." } };
        }

        const orders = await this.orderRepository.list({ where, take, skip });

        return {
            status: 200,
            body: { orders, pagination: { take, skip } },
        };
    }

    async updateOrderStatus(
        auth: { user_id: string; role: string },
        order_id: string,
        dto: UpdateOrderStatusDTO
    ) {
        const role = auth.role as Role;

        // Apenas SUPPLIER pode atualizar status
        if (role !== "SUPPLIER") {
            return {
                status: 403,
                body: { message: "Apenas fornecedores podem atualizar status." },
            };
        }

        // Pedido existe?
        const order = await this.orderRepository.findById(order_id);
        if (!order) {
            return { status: 404, body: { message: "Pedido não encontrado." } };
        }

        // Pedido pertence ao fornecedor logado?
        if (order.supplier_id !== auth.user_id) {
            return {
                status: 403,
                body: { message: "Você não tem permissão para alterar este pedido." },
            };
        }

        const current = order.status as Status;
        const next = dto.status;
        const deliveryType = order.delivery_type; // "DELIVERY" | "PICKUP"

        let isValidTransition = false;

        // Regras para PICKUP
        if (deliveryType === "PICKUP") {
            if (next === "IN_TRANSIT") {
                return {
                    status: 400,
                    body: {
                        message: "Pedidos PICKUP não podem ser marcados como IN_TRANSIT.",
                    },
                };
            }

            // ACCEPTED -> PICKED_UP
            isValidTransition = current === "ACCEPTED" && next === "PICKED_UP";
        } else {
            // Regras para DELIVERY
            isValidTransition =
                (current === "ACCEPTED" && next === "IN_TRANSIT") ||
                (current === "IN_TRANSIT" && next === "DELIVERED");
        }

        if (!isValidTransition) {
            return {
                status: 400,
                body: { message: `Transição inválida: ${current} -> ${next}` },
            };
        }

        // Define data de finalização
        const delivered_at =
            next === "DELIVERED" || next === "PICKED_UP"
                ? new Date()
                : undefined;

        const updated = await this.orderRepository.updateStatus({
            order_id,
            status: next,
            delivered_at,
        });

        // Notifica cliente
        try {
            await this.notificationService.notifyOrderStatusToClient({
                order_id: updated.order_id,
                client_id: updated.client_id,
                status: updated.status as Status,
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[OrderService] notifyOrderStatusToClient(${next}) failed: ${msg}`);
        }

        return {
            status: 200,
            body: {
                message: "Status atualizado com sucesso.",
                order: updated,
            },
        };
    }

    async cancelOrder(auth: { user_id: string; role: string }, order_id: string) {
        const role = auth.role as Role;

        const order = await this.orderRepository.findById(order_id);
        if (!order) return { status: 404, body: { message: "Pedido não encontrado." } };

        const current = order.status as Status;

        if (role === "CLIENT") {
            if (order.client_id !== auth.user_id) {
                return { status: 403, body: { message: "Você não tem permissão para cancelar este pedido." } };
            }
            if (current !== "PENDING") {
                return { status: 400, body: { message: "Cliente só pode cancelar pedidos em PENDING." } };
            }
        } else if (role === "SUPPLIER") {
            if (order.supplier_id !== auth.user_id) {
                return { status: 403, body: { message: "Você não tem permissão para cancelar este pedido." } };
            }
            if (current !== "ACCEPTED") {
                return { status: 400, body: { message: "Fornecedor só pode cancelar pedidos em ACCEPTED." } };
            }
        } else {
            return { status: 403, body: { message: "Acesso não permitido." } };
        }

        const updated = await this.orderRepository.updateStatus({
            order_id,
            status: "CANCELLED",
        });

        // ✅ ADD: notifica CLIENTE (cancelado)
        try {
            await this.notificationService.notifyOrderStatusToClient({
                order_id: updated.order_id,
                client_id: updated.client_id,
                status: updated.status as Status, // CANCELLED
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[OrderService] notifyOrderStatusToClient(CANCELLED) failed: ${msg}`);
        }

        return {
            status: 200,
            body: { message: "Pedido cancelado com sucesso.", order: updated },
        };
    }
}
