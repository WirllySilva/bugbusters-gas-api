import type { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import type { AuthPayload } from "../middlewares/authMiddleware";

import type { CreateLoginOtpDTO } from "../dtos/auth/CreateLoginOtpDTO";
import type { VerifyLoginOtpDTO } from "../dtos/auth/VerifyLoginOtpDTO";
import { AuthService } from "../services/AuthService";
import { CompleteProfileDTO } from "../dtos/auth/CompleteProfileDTO";
import { CreateRegisterOtpDTO } from "../dtos/auth/CreateRegisterOtpDTO";
import { VerifyRegisterOtpDTO } from "../dtos/auth/VerifyRegisterOtpDTO";
import { CompleteSupplierInfoDTO } from "../dtos/auth/CompleteSupplierInfoDTO";

type AuthedRequest = Request & { auth?: AuthPayload };

export function createAuthControllers(prisma: PrismaClient) {
  const authService = new AuthService(prisma);

  // *** LOGIN ***
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
        needs_profile_completion: result.needsProfileCompletion,
        needs_supplier_info_completion: result.needsSupplierInfoCompletion,
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

  // *** REGISTER ***

  const sendRegisterOtp = async (req: Request, res: Response) => {
    try {
      const { phone, role } = req.body as CreateRegisterOtpDTO;

      if (!phone || !role) {
        return res.status(400).json({ message: "Telefone e Role são obrigatórios." });
      }

      const result = await authService.sendRegisterOtp(phone);

      return res.status(200).json({
        message: "Código OTP enviado com sucesso.",
        dev_otp: result.otpCode, // remover em produção
      });
    } catch (error) {
      const err = error as Error;

      if (err.message === "Telefone já cadastrado") {
        return res.status(409).json({ message: err.message });
      }

      console.error("Erro no controller sendRegisterOtp:", err);
      return res.status(500).json({ error: "Erro interno ao processar solicitação." });
    }
  };

  const verifyRegisterOtp = async (req: Request, res: Response) => {
    try {
      const { phone, otp_code, role } = req.body as VerifyRegisterOtpDTO;

      if (!phone || !otp_code || !role) {
        return res.status(400).json({ message: "Telefone, Código OTP e Role são obrigatórios." });
      }

      const result = await authService.verifyRegisterOtp(phone, otp_code, role);

      return res.status(200).json({
        message: "OTP verificado com sucesso.",
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      const err = error as Error;

      if (err.message === "Código inválido" || err.message === "Código expirado") {
        return res.status(401).json({ message: err.message });
      }

      if (err.message === "Telefone já cadastrado") {
        return res.status(409).json({ message: err.message });
      }

      console.error("Erro no controller verifyRegisterOtp:", err);
      return res.status(500).json({ error: "Falha na validação do OTP." });
    }
  };

  const completeProfile = async (req: Request, res: Response) => {
    try {
      const body = req.body as CompleteProfileDTO;

      if (!body?.name) {
        return res.status(400).json({ message: "Nome é obrigatório." });
      }

      const userId = (req as AuthedRequest).auth?.user_id;

      if (!userId) {
        return res.status(401).json({ message: "Token inválido ou ausente." });
      }

      const result = await authService.completeProfile(userId, body);

      return res.status(200).json({
        message: "Cadastro atualizado com sucesso.",
        user: result.user,
      });
    } catch (error) {
      const err = error as Error;
      console.error("Erro no controller completeProfile:", err);
      return res.status(500).json({ error: "Erro ao completar cadastro." });
    }
  };

  const completeSupplierInfo = async (req: Request, res: Response) => {
    try {
      const body = req.body as CompleteSupplierInfoDTO;

      const userId = (req as AuthedRequest).auth?.user_id;
      if (!userId) {
        return res.status(401).json({ message: "Token inválido ou ausente." });
      }

      const result = await authService.completeSupplierInfo(userId, body);

      return res.status(200).json({
        message: "Informações do fornecedor atualizadas com sucesso.",
        supplier_info: result.supplierInfo,
      });
    } catch (error) {
      const err = error as Error;

      if (err.message === "Usuário não encontrado") {
        return res.status(404).json({ message: err.message });
      }

      if (err.message === "Apenas fornecedor pode completar supplier_info") {
        return res.status(403).json({ message: err.message });
      }

      console.error("Erro no controller completeSupplierInfo:", err);
      return res.status(500).json({ error: "Erro ao completar dados do fornecedor." });
    }
  };

  return { sendLoginOtp, verifyLoginOtp, sendRegisterOtp, verifyRegisterOtp, completeProfile, completeSupplierInfo };
}
