import { Request, Response } from "express";
import { ConsumptionEventRepository } from "../repositories/ConsumptionEventRepository";
import { ConsumptionService } from "../services/ConsumptionService";
import { ConsumptionCurrentRepository } from "../repositories/ConsumptionCurrentRepository";

export class ConsumptionController {
    private readonly service = new ConsumptionService(
        new ConsumptionEventRepository(),
        new ConsumptionCurrentRepository()
        );

    async create(req: Request, res: Response) {
        const data = req.body;

        await this.service.processReading(data);

        const event = await this.service.registerEvent(data);

        return res.status(201).json({
            success: true,
            event
        });
    }
}