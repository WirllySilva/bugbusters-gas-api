import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ProviderController } from "../controllers/ProviderController";
import { authMiddleware } from "../config/authMiddleware";

export default function providerRoutes(prisma: PrismaClient) {
    const router = Router();
    const controller = new ProviderController(prisma);

    router.post(
        "/providers",
        authMiddleware,
        controller.create.bind(controller)
    );

    return router;
}
