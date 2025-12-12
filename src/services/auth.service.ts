import { PrismaClient } from '@prisma/client';
// 👇 1. ADICIONE ESSE IMPORT AQUI!
import { role } from '@prisma/client'; 

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../utils'; 
import { sendNotification } from './index'; 

const OTP_EXPIRY_MS = 5 * 60 * 1000; 

export class AuthService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async sendOtpService(phone: string, role: role) { 
        
        let user = await this.prisma.user.findUnique({ where: { phone } });

        if (!user) {
            user = await this.prisma.user.create({
                data: { user_id: uuidv4(), phone, role }
            });
        }

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        await this.prisma.otp_code.upsert({
            where: { phone },
            update: { otp_code: otpCode, expires_at: expiresAt },
            create: { phone, otp_code: otpCode, expires_at: expiresAt, id: uuidv4() },
        });

        await sendNotification(phone, `Seu código é: ${otpCode}`);

        return { otpCode };
    }

    async verifyOtpService(phone: string, code: string) {
        
        const otpRecord = await this.prisma.otp_code.findUnique({ where: { phone } });

        if (!otpRecord || otpRecord.otp_code !== code) {
            throw new Error('Código inválido');
        }

        if (new Date() > otpRecord.expires_at) {
            await this.prisma.otp_code.delete({ where: { phone } });
            throw new Error('Código expirado');
        }

        const user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user) throw new Error('Usuário não encontrado');

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role, phone: user.phone },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        await this.prisma.otp_code.delete({ where: { phone } });

        return { token, user };
    }
}