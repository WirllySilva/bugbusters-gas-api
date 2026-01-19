import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { OrderController } from "../controllers/OrderController";

const orderRoutes = Router();
const controller = new OrderController();

// Criar pedido como cliente
orderRoutes.post("/orders", requireAuth, controller.create);

// Aceitar pedido como fornecedor
orderRoutes.patch("/orders/:order_id/accept", requireAuth, controller.accept);

// Listar pedidos client ou supplier
orderRoutes.get("/orders", requireAuth, controller.list);

// Fornecedor atualiza status do pedido
orderRoutes.patch("/orders/:order_id/status", requireAuth, controller.updateStatus);

// Cancelar pedido
orderRoutes.patch("/orders/:order_id/cancel", requireAuth, controller.cancel);

export default orderRoutes;
