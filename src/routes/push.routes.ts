import { Router } from "express";
import { PushController } from "../controllers/PushController";

const router = Router();
const controller = new PushController();

router.post("/register", (req, res) => controller.register(req, res));

export default router;
