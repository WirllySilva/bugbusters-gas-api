import { Request, Response } from "express";
import { AlertService } from "../services/AlertService";

export class AlertController {
  private alertService = new AlertService();

  // GET /alerts?user_id=...
  async list(req: Request, res: Response) {
    const user_id = String(req.query.user_id || "");
    if (!user_id) return res.status(400).json({ message: "user_id is required in query string." });

    const alerts = await this.alertService.listAlerts(user_id);
    return res.status(200).json(alerts);
  }

  // GET /alerts/consumption?user_id=...
  async listConsumption(req: Request, res: Response) {
    const user_id = String(req.query.user_id || "");
    if (!user_id) return res.status(400).json({ message: "user_id is required in query string." });

    const alerts = await this.alertService.listConsumptionAlerts(user_id);
    return res.status(200).json(alerts);
  }

  // PATCH /alerts/:id/handled
  async markHandled(req: Request, res: Response) {
    const alert_id = String(req.params.id || "");
    const { handled } = req.body as { handled: boolean };

    if (!alert_id) return res.status(400).json({ message: "alert_id is required." });
    if (typeof handled !== "boolean") return res.status(400).json({ message: "handled must be boolean." });

    const updated = await this.alertService.markHandled(alert_id, handled);
    return res.status(200).json(updated);
  }
}
