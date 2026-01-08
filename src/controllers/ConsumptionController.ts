import { Request, Response } from "express";
import { ConsumptionEventRepository } from "../repositories/ConsumptionEventRepository";
import { ConsumptionService } from "../services/ConsumptionService";

export class ConsumptionController {
    private readonly service = new ConsumptionService(new ConsumptionEventRepository());

    async create(req: Request, res: Response) {
        const data = req.body;

        const result = await this.service.registerEvent(data);

        return res.status(201).json(result);
    }
}