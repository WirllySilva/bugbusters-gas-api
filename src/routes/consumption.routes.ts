import { Router } from "express";
import { ConsumptionController } from "../controllers";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireSensorOrAuth } from "../middlewares/sensorOrAuthMiddleware";

const router = Router();
const controller = new ConsumptionController();

router.post("/consumption/sensor-readings", requireSensorOrAuth, (req, res) => controller.create(req, res));

router.get("/consumption/history", requireAuth, (req, res) => controller.history(req, res));
router.get("/consumption/monthly", requireAuth, (req, res) => controller.monthly(req, res));
router.get("/consumption/pdf", requireAuth, (req, res) => controller.monthlyPdf(req, res));

export default router;
