import { Request, Response } from 'express';
import { OrderService } from './OrderService';

export class OrderController {
  private orderService = new OrderService();

  async create(req: Request, res: Response) {
    const client_id = req.user.user_id; // vem do authMiddleware
    const { supplier_id, delivery_type, address_id, notes } = req.body;

    const order = await this.orderService.create({
      client_id,
      supplier_id,
      delivery_type,
      address_id,
      notes,
    });

    return res.status(201).json(order);
  }
}
