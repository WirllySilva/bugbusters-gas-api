import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { CreateOrderDTO } from "../dtos/order/CreateOrderDTO";
import { AcceptOrderDTO } from "../dtos/order/AcceptOrderDTO";
import { ListOrdersQueryDTO } from "../dtos/order/ListOrdersQueryDTO";
import { UpdateOrderStatusDTO } from "../dtos/order/UpdateOrderStatusDTO";

type AuthedRequest = Request & {
    auth?: {
        user_id: string;
        role: string;
        phone: string;
    };
};

const ORDER_STATUSES = ["PENDING", "ACCEPTED", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

function isOrderStatus(value: unknown): value is OrderStatus {
    return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

export class OrderController {
    private readonly orderService = new OrderService();

    create = async (req: Request, res: Response) => {
        const authedReq = req as AuthedRequest;

        if (!authedReq.auth) {
            return res.status(401).json({ message: "Token ausente." });
        }

        const body = req.body as Partial<CreateOrderDTO>;

        if (!body.supplier_id || !body.delivery_type) {
            return res.status(400).json({
                message: "supplier_id e delivery_type são obrigatórios.",
            });
        }

        const result = await this.orderService.createOrder(
            authedReq.auth,
            body as CreateOrderDTO
        );

        return res.status(result.status).json(result.body);
    };

    accept = async (req: Request, res: Response) => {
        const authedReq = req as AuthedRequest;

        if (!authedReq.auth) {
            return res.status(401).json({ message: "Token ausente." });
        }

        const { order_id } = req.params;
        if (!order_id) {
            return res.status(400).json({ message: "order_id é obrigatório." });
        }

        const body = req.body as Partial<AcceptOrderDTO>;

        const result = await this.orderService.acceptOrder(
            authedReq.auth,
            order_id,
            body as AcceptOrderDTO
        );

        return res.status(result.status).json(result.body);
    };

    list = async (req: Request, res: Response) => {
        const authedReq = req as AuthedRequest;
        if (!authedReq.auth) return res.status(401).json({ message: "Token ausente." });

        const { status, take, skip } = req.query;

        const query: ListOrdersQueryDTO = {
            status: isOrderStatus(status) ? status : undefined,
            take: typeof take === "string" ? Number(take) : undefined,
            skip: typeof skip === "string" ? Number(skip) : undefined,
        };

        const result = await this.orderService.listOrders(authedReq.auth, query);
        return res.status(result.status).json(result.body);
    };

    updateStatus = async (req: Request, res: Response) => {
        const authedReq = req as AuthedRequest;
        if (!authedReq.auth) {
            return res.status(401).json({ message: "Token ausente." });
        }

        const { order_id } = req.params;
        const body = req.body as Partial<UpdateOrderStatusDTO>;

        if (!order_id) {
            return res.status(400).json({ message: "order_id é obrigatório." });
        }

        if (!body.status || !["IN_TRANSIT", "DELIVERED", "PICKED_UP"].includes(body.status)) {
            return res.status(400).json({
                message: "status deve ser IN_TRANSIT, DELIVERED ou PICKED_UP.",
            });
        }

        const result = await this.orderService.updateOrderStatus(
            authedReq.auth,
            order_id,
            body as UpdateOrderStatusDTO
        );

        return res.status(result.status).json(result.body);
    };

    cancel = async (req: Request, res: Response) => {
        const authedReq = req as AuthedRequest;
        if (!authedReq.auth) return res.status(401).json({ message: "Token ausente." });

        const { order_id } = req.params;
        if (!order_id) return res.status(400).json({ message: "order_id é obrigatório." });

        const result = await this.orderService.cancelOrder(authedReq.auth, order_id);
        return res.status(result.status).json(result.body);
    };
}
