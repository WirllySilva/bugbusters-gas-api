import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middlewares/authMiddleware";
import { createUserControllers } from "../controllers/UserController";

export default function userRoutes(prisma: PrismaClient) {
  const router = Router();

  const { updateMyProfile } = createUserControllers(prisma);

  router.put("/users/me/profile", requireAuth, updateMyProfile);

  return router;
}
