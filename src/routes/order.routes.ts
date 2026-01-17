import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { OrderController } from "../controllers/OrderController";

const router = Router();
const controller = new OrderController();

router.post("/orders", requireAuth, controller.create);

router.patch("/orders/:order_id/accept", requireAuth, controller.accept);

export default router;
