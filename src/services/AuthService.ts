import { PrismaClient, role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { generateOTP, sendNotification } from "../utils";
import { CompleteProfileDTO } from "../dtos/auth/CompleteProfileDTO";
import { CompleteSupplierInfoDTO } from "../dtos/auth/CompleteSupplierInfoDTO";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export class AuthService {
  constructor(private readonly prisma: PrismaClient) { }

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
    let verifiedUser = user;
    if (!user.is_verified) {
      verifiedUser = await this.prisma.user.update({
        where: { phone },
        data: { is_verified: true },
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado");

    const token = jwt.sign(
      { user_id: verifiedUser.user_id, role: verifiedUser.role, phone: verifiedUser.phone, name: verifiedUser.name ?? undefined, },
      secret,
      { expiresIn: "1d" }
    );

    await this.prisma.otp_code.delete({ where: { phone } });

    const needsProfileCompletion = !verifiedUser.name;

    let needsSupplierInfoCompletion = false;
    if(verifiedUser.role === role.SUPPLIER) {
      const supplierInfo  = await this.prisma.supplier_info.findUnique({
        where:{ user_id: verifiedUser.user_id},
      });
      needsSupplierInfoCompletion = !supplierInfo;
    }

    return { token, user: verifiedUser, needsProfileCompletion, needsSupplierInfoCompletion };
  }

  async sendRegisterOtp(phone: string) {
    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing && !existing.deleted_at) {
      throw new Error("Telefone já cadastrado");
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await this.prisma.otp_code.upsert({
      where: { phone },
      update: { otp_code: otpCode, expires_at: expiresAt },
      create: { phone, otp_code: otpCode, expires_at: expiresAt },
    });

    await sendNotification(phone, `Seu código é: ${otpCode}`);

    return { otpCode };
  }

  async verifyRegisterOtp(phone: string, code: string, userRole: role) {
    const otpRecord = await this.prisma.otp_code.findUnique({ where: { phone } });

    if (otpRecord?.otp_code !== code) {
      throw new Error("Código inválido");
    }

    if (new Date() > otpRecord.expires_at) {
      await this.prisma.otp_code.delete({ where: { phone } });
      throw new Error("Código expirado");
    }

    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing && !existing.deleted_at) {
      // alguém cadastrou nesse meio tempo
      await this.prisma.otp_code.delete({ where: { phone } });
      throw new Error("Telefone já cadastrado");
    }

    // cria um usuário agora e marca como verificado
    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {
        role: userRole,
        is_verified: true,
        deleted_at: null, // reativa se estava deletado
      },
      create: {
        phone,
        role: userRole,
        is_verified: true,
      },
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado");

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, phone: user.phone, name: user.name ?? undefined, },
      secret,
      { expiresIn: "1d" }
    );

    await this.prisma.otp_code.delete({ where: { phone } });

    return { token, user };
  }

  async completeProfile(user_id: string, data: CompleteProfileDTO) {
    const user = await this.prisma.user.update({
      where: { user_id },
      data: {
        name: data.name,
        email: data.email ?? undefined,
      },
    });

    if (data.address) {
      await this.prisma.address.create({
        data: {
          user_id: user.user_id,
          street: data.address.street,
          number: data.address.number,
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          state: data.address.state,
          zip_code: data.address.zip_code,
          latitude: data.address.latitude,
          longitude: data.address.longitude,
          label: data.address.label,
          is_default: data.address.is_default ?? true,
        },
      });
    }

    return { user };
  }

  async completeSupplierInfo(user_id: string, data: CompleteSupplierInfoDTO) {
    const user = await this.prisma.user.findUnique({ where: { user_id } });
    if (!user) throw new Error("Usuário não encontrado");

    if (user.role !== role.SUPPLIER) {
      throw new Error("Apenas fornecedor pode completar supplier_info");
    }

    const supplierInfo = await this.prisma.supplier_info.upsert({
      where: { user_id },
      update: {
        payment_methods: data.payment_methods ?? undefined,
        open_time: data.open_time ?? undefined,
        close_time: data.close_time ?? undefined,
        open_days: data.open_days ?? undefined,
        is_active: data.is_active ?? undefined,
        deliveryTimes: data.deliveryTimes ?? undefined,
      },
      create: {
        user_id,
        payment_methods: data.payment_methods ?? undefined,
        open_time: data.open_time ?? undefined,
        close_time: data.close_time ?? undefined,
        open_days: data.open_days ?? undefined,
        is_active: data.is_active ?? true,
        deliveryTimes: data.deliveryTimes ?? undefined,
      },
    });

    return { supplierInfo };
  }
}

