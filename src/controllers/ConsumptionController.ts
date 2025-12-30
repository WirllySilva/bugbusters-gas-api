import { Request, Response } from "express";
import { SensorReadingRepository } from "../repositories/SensorReadingRepository";
import { ConsumptionService } from "../services/ConsumptionService";

export class ConsumptionController {
    private readonly service = new ConsumptionService(new SensorReadingRepository());

    async read(req: Request, res: Response) {
        const data = req.body;

        const result = await this.service.registerReading(data);

        return res.status(201).json(result);
    }
}