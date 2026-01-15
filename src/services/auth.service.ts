import { PrismaClient, role } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

import { generateOTP } from "../utils";
import { sendNotification } from "./index";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export class AuthService {
    constructor(private readonly prisma: PrismaClient) { }

    async sendOtpService(phone: string, role: role) {
        const user = await this.prisma.user.findUnique({ where: { phone } });

        // Prefer nullish coalescing assignment instead of if (!user) ...
        if (!user) {
            await this.prisma.user.create({
                data: { user_id: uuidv4(), phone, role },
            });
        }

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        await this.prisma.otp_code.upsert({
            where: { phone },
            update: { otp_code: otpCode, expires_at: expiresAt },
            create: {
                id: uuidv4(),
                phone,
                otp_code: otpCode,
                expires_at: expiresAt,
            },
        });

        await sendNotification(phone, `Seu código é: ${otpCode}`);

        return { otpCode };
    }

    async verifyOtpService(phone: string, code: string) {
        const otpRecord = await this.prisma.otp_code.findUnique({
            where: { phone },
        });

        if (otpRecord?.otp_code !== code) {
            throw new Error("Código inválido");
        }

        if (new Date() > otpRecord.expires_at) {
            await this.prisma.otp_code.delete({ where: { phone } });
            throw new Error("Código expirado");
        }

        const user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user) throw new Error("Usuário não encontrado");

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
