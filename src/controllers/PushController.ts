import { Request, Response } from "express";
import { DeviceTokenRepository } from "../repositories/DeviceTokenRepository";
import { RegisterDeviceTokenDTO } from "../dtos/push/RegisterDeviceTokenDTO";

export class PushController {
  private deviceTokenRepo = new DeviceTokenRepository();

  // POST /push/register?user_id=...
  async register(req: Request, res: Response) {
    const user_id = String(req.query.user_id || "");
    const body = req.body as RegisterDeviceTokenDTO;

    if (!user_id) return res.status(400).json({ message: "user_id is required in query string." });
    if (!body?.token || !body?.platform) return res.status(400).json({ message: "token and platform are required." });

    const saved = await this.deviceTokenRepo.upsertToken({
      user_id,
      token: body.token,
      platform: body.platform,
    });

    return res.status(201).json({ message: "Device token registered.", device_token: saved });
  }
}
