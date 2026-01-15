import type { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";

import type { CreateLoginOtpDTO } from "../dtos/auth/CreateLoginOtpDTO";
import type { VerifyLoginOtpDTO } from "../dtos/auth/VerifyLoginOtpDTO";
import { AuthService } from "../services/AuthService";

export function createAuthControllers(prisma: PrismaClient) {
  const authService = new AuthService(prisma);

  const sendLoginOtp = async (req: Request, res: Response) => {
    try {
      const { phone, role } = req.body as CreateLoginOtpDTO;

      if (!phone) {
        return res.status(400).json({ message: "Telefone é obrigatório." });
      }

      const result = await authService.sendLoginOtp(phone, role);

      return res.status(200).json({
        message: "Código OTP enviado com sucesso.",
        dev_otp: result.otpCode,
      });
    } catch (error) {
      const err = error as Error;

      if (err.message === "Usuário não cadastrado") {
        return res.status(404).json({ message: err.message });
      }

      if (err.message === "Role inválida para este usuário") {
        return res.status(403).json({ message: err.message });
      }

      console.error("Erro no controller sendLoginOtp:", err);
      return res.status(500).json({ error: "Erro interno ao processar solicitação." });
    }
  };

  const verifyLoginOtp = async (req: Request, res: Response) => {
    try {
      const { phone, otp_code } = req.body as VerifyLoginOtpDTO;

      if (!phone || !otp_code) {
        return res.status(400).json({ message: "Telefone e Código OTP são obrigatórios." });
      }

      const result = await authService.verifyLoginOtp(phone, otp_code);

      return res.status(200).json({
        message: "Login bem-sucedido.",
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      const err = error as Error;

      if (err.message === "Código inválido" || err.message === "Código expirado") {
        return res.status(401).json({ message: err.message });
      }

      if (err.message === "Usuário não encontrado") {
        return res.status(404).json({ message: err.message });
      }

      console.error("Erro no controller verifyLoginOtp:", err);
      return res.status(500).json({ error: "Falha na autenticação." });
    }
  };

  return { sendLoginOtp, verifyLoginOtp };
}
