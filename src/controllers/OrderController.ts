import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { CreateOrderDTO } from "../dtos/order/CreateOrderDTO";
import { AcceptOrderDTO } from "../dtos/order/AcceptOrderDTO";

type AuthedRequest = Request & {
  auth?: {
    user_id: string;
    role: string;
    phone: string;
  };
};

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
}
