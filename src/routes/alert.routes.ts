import { Router } from "express";
import { AlertController } from "../controllers/AlertController";

const router = Router();
const controller = new AlertController();

router.get("/", (req, res) => controller.list(req, res));
router.get("/consumption", (req, res) => controller.listConsumption(req, res));
router.patch("/:id/handled", (req, res) => controller.markHandled(req, res));

export default router;
