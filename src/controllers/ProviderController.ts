import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ProviderService } from "../services/ProviderService";

export class ProviderController {
    private service: ProviderService;

    constructor(prisma: PrismaClient) {
        this.service = new ProviderService();
    }

    async create(req: Request, res: Response) {
        try {
            // 🔐 vem do authMiddleware
            const userId = req.user?.user_id;

            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const provider = await this.service.create(userId, req.body);

            return res.status(201).json(provider);
        } catch (error: any) {
            return res.status(400).json({
                message: error.message || "Erro ao criar fornecedor"
            });
        }
    }
}
