import { Request, Response } from "express";
import { NotificationService } from "../services/NotificationService";

export class NotificationController {
  private notificationService = new NotificationService();

  // GET /notifications/test?user_id=...
  async test(req: Request, res: Response) {
    const user_id = String(req.query.user_id || "");

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required in query string." });
    }

    const wa = await this.notificationService.send({
      user_id,
      channel: "WHATSAPP",
      template: "TEST",
      message: "Teste de notificação WhatsApp (mock).",
      payload: { kind: "test" },
    });

    const push = await this.notificationService.send({
      user_id,
      channel: "PUSH",
      template: "TEST",
      title: "Teste Push",
      message: "Teste de notificação Push (mock).",
      payload: { kind: "test" },
    });

    return res.status(200).json({ whatsapp: wa, push });
  }
}
