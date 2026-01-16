import type { PrismaClient } from "@prisma/client";
import type { UpdateMyProfileDTO } from "../dtos/user/UpdateMyProfileDTO";

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  async updateMyProfile(user_id: string, data: UpdateMyProfileDTO) {
    await this.prisma.user.update({
      where: { user_id },
      data: {
        name: data.name ?? undefined,
        email: data.email ?? undefined,
      },
    });

    if (data.address) {
      const shouldBeDefault = data.address.is_default ?? true;

      // tenta achar endereço default atual
      const existingDefault = await this.prisma.address.findFirst({
        where: { user_id, is_default: true },
      });

      if (shouldBeDefault) {
        // garante unicidade do default
        await this.prisma.address.updateMany({
          where: { user_id },
          data: { is_default: false },
        });
      }

      if (existingDefault) {
        await this.prisma.address.update({
          where: { address_id: existingDefault.address_id },
          data: {
            street: data.address.street,
            number: data.address.number,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zip_code: data.address.zip_code,
            latitude: data.address.latitude,
            longitude: data.address.longitude,
            label: data.address.label,
            is_default: shouldBeDefault,
          },
        });
      } else {
        await this.prisma.address.create({
          data: {
            user_id,
            street: data.address.street,
            number: data.address.number,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zip_code: data.address.zip_code,
            latitude: data.address.latitude,
            longitude: data.address.longitude,
            label: data.address.label,
            is_default: shouldBeDefault,
          },
        });
      }
    }

    const updatedUser = await this.prisma.user.findUnique({
      where: { user_id },
      include: {
        addresses: true,
      },
    });

    return { user: updatedUser };
  }
}
