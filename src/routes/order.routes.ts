import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { OrderController } from "../controllers/OrderController";

const orderRoutes = Router();
const controller = new OrderController();

// Criar pedido como cliente
orderRoutes.post("/orders", requireAuth, controller.create);

// Aceitar pedido como fornecedor
orderRoutes.patch("/orders/:order_id/accept", requireAuth, controller.accept);

export default orderRoutes;
