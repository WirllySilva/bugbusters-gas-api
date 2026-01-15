import { Router } from "express";
import { ConsumptionController } from "../controllers/ConsumptionController";

const router = Router();
const controller = new ConsumptionController();

router.post("/consumption/sensor-readings", (req, res) => controller.create(req, res));

router.get("/consumption/history", (req, res) => controller.history(req, res));
router.get("/consumption/monthly", (req, res) => controller.monthly(req, res));
router.get("/consumption/pdf", (req, res) => controller.monthlyPdf(req, res));

export default router;
