import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";

const router = Router();
const controller = new NotificationController();

router.get("/test", (req, res) => controller.test(req, res));

export default router;
