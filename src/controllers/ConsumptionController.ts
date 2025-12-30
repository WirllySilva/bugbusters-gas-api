import { Request, Response } from "express";
import { ConsumptionRepository } from "../repositories/ConsumptionRepository";
import { ConsumptionService } from "../services/ConsumptionService";

export class ConsumptionController {
    private readonly service = new ConsumptionService(new ConsumptionRepository());

    async read(req: Request, res: Response) {
        const data = req.body;

        const result = await this.service.registerConsumption(data);

        return res.status(201).json(result);
    }
}