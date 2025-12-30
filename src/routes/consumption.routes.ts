import { Router } from "express";
import { ConsumptionController } from "../controllers/ConsumptionController";

const router = Router();
const controller = new ConsumptionController();

router.post("/consumption/read", (req, res) => controller.read(req, res));

export default router;
