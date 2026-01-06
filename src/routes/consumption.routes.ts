import { Router } from "express";
import { ConsumptionController } from "../controllers/ConsumptionController";

const router = Router();
const controller = new ConsumptionController();

router.post("/consumption/sensor-readings", (req, res) => controller.create(req, res));

export default router;
