import type { PrismaClient, role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { generateOTP, sendNotification } from "../utils";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async sendLoginOtp(phone: string, expectedRole?: role) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user || user.deleted_at) {
        throw new Error("Usuário não cadastrado");
    }
    
    // Login não cadastra usuário
    if (!user) {
      throw new Error("Usuário não cadastrado");
    }

    //  garante que está logando na tela certa
    if (expectedRole && user.role !== expectedRole) {
      throw new Error("Role inválida para este usuário");
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await this.prisma.otp_code.upsert({
      where: { phone },
      update: { otp_code: otpCode, expires_at: expiresAt },
      create: {
        phone,
        otp_code: otpCode,
        expires_at: expiresAt,
      },
    });

    await sendNotification(phone, `Seu código é: ${otpCode}`);

    return { otpCode }; // Lembrar de remover essa linha em produção
  }

  async verifyLoginOtp(phone: string, code: string) {
    const otpRecord = await this.prisma.otp_code.findUnique({ where: { phone } });

    
    if (otpRecord?.otp_code !== code) {
      throw new Error("Código inválido");
    }

    if (new Date() > otpRecord.expires_at) {
      await this.prisma.otp_code.delete({ where: { phone } });
      throw new Error("Código expirado");
    }

    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new Error("Usuário não encontrado");

    // marca verificado
    if (!user.is_verified) {
      await this.prisma.user.update({
        where: { phone },
        data: { is_verified: true },
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado");

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, phone: user.phone },
      secret,
      { expiresIn: "1d" }
    );

    await this.prisma.otp_code.delete({ where: { phone } });

    return { token, user };
  }
}
