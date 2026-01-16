import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { createAuthControllers } from "../controllers";
import { requireAuth } from "../middlewares/authMiddleware";

export default function authRoutes(prisma: PrismaClient) {
  const router = Router();

  const { sendLoginOtp, verifyLoginOtp, sendRegisterOtp, verifyRegisterOtp, completeProfile, completeSupplierInfo } = createAuthControllers(prisma);

  router.post("/auth/login/send-otp", sendLoginOtp);
  router.post("/auth/login/verify-otp", verifyLoginOtp);

  router.post("/auth/register/send-otp", sendRegisterOtp);
  router.post("/auth/register/verify-otp", verifyRegisterOtp);
  router.put("/auth/register/complete-profile", requireAuth, completeProfile);
  router.put("/auth/register/complete-supplier-info", requireAuth, completeSupplierInfo);

  return router;
}
