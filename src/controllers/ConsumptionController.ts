import { Request, Response } from "express";
import { ConsumptionEventRepository } from "../repositories/ConsumptionEventRepository";
import { ConsumptionService } from "../services/ConsumptionService";
import { ConsumptionCurrentRepository } from "../repositories/ConsumptionCurrentRepository";
import { ConsumptionRepository } from "../repositories/ConsumptionRepository";
import { PdfReportService } from "../services/PdfReportService";
import { AuthPayload } from "../middlewares/authMiddleware";

type AuthedRequest = Request & {auth?: AuthPayload};

export class ConsumptionController {
    private readonly service = new ConsumptionService(
        new ConsumptionEventRepository(),
        new ConsumptionCurrentRepository(),
        new ConsumptionRepository()
        );
    
    private readonly pdf = new PdfReportService();

    async history(req: AuthedRequest, res: Response) {
        const userId = req.auth?.user_id;
        if(!userId) {
            return res.status(401).json({ message: "Unauthorized "});
        }

        const date = typeof req.query.date === "string" ? req.query.date : undefined;
        if (!date) {
            return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
        }

        const details = typeof req.query.details === "string" ? req.query.details !== "false" : true;

        try {
            const data = await this.service.getDailyHistory(userId, date, details);
            return res.json(data);
        } catch {
            return res.status(400).json({ message: "Invalid date. Use YYY-MM-DD"});
        }
    }

    async monthly(req: AuthedRequest, res: Response) {
        const userId = req.auth?.user_id;
        if(!userId) {
            return res.status(401).json({ message: "Unauthorized"});
        }

        const month = typeof req.query.month === "string" ? req.query.month: "";

        try {
            const data = await this.service.getMonthlyHistory(userId, month);
            return res.json(data);
        } catch {
            return res.status(400).json({ message: "Invalid month. Use YYYY-MM" });
        }
    }

    async monthlyPdf(req: AuthedRequest, res: Response) {
        const userId = req.auth?.user_id;
        if(!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const month = typeof req.query.month === "string" ? req.query.month: "";

        try {
            const report = await this.service.getMonthlyHistory(userId, month);
            const pdfBuffer = await this.pdf.generateMonthlyConsumptionPdf({
                userName: req.auth?.name ?? req.auth?.phone,
                report,
            });
            
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="consumption-${month}.pdf"`);
            return res.send(pdfBuffer);
        } catch {
            return res.status(400).json({ message: "invalid month. Use YYYY-MM" });
        }
    }

    async create(req: AuthedRequest, res: Response) {
        const data = req.body;

        await this.service.processReading(data);

        const event = await this.service.registerEvent(data);

        return res.status(201).json({
            success: true,
            event
        });
    }
}