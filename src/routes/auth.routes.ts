import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { createAuthControllers } from "../controllers/AuthController";

export default function authRoutes(prisma: PrismaClient) {
  const router = Router();

  const { sendLoginOtp, verifyLoginOtp } = createAuthControllers(prisma);

  router.post("/auth/login/send-otp", sendLoginOtp);
  router.post("/auth/login/verify-otp", verifyLoginOtp);

  return router;
}
