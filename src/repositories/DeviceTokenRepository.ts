import { prisma } from "../database/prisma";

export class DeviceTokenRepository {
  async upsertToken(data: { user_id: string; token: string; platform: string }) {
    return prisma.device_token.upsert({
      where: { token: data.token },
      create: {
        user_id: data.user_id,
        token: data.token,
        platform: data.platform,
        enabled: true,
        last_seen_at: new Date(),
      },
      update: {
        user_id: data.user_id,
        platform: data.platform,
        enabled: true,
        last_seen_at: new Date(),
      },
    });
  }

  async getEnabledTokens(user_id: string) {
    return prisma.device_token.findMany({
      where: { user_id, enabled: true },
      orderBy: { created_at: "desc" },
    });
  }
}
