import { ProviderRepository } from "../repositories/ProviderRepository";
import { CreateProviderDTO } from "../dtos/CreateProviderDTO";
import { prisma } from "../database/prisma";

export class ProviderService {
    private repository = new ProviderRepository();

    async create(userId: string, data: CreateProviderDTO) {
        // Verificar se o usuário já é fornecedor
        const providerExists = await prisma.supplier_info.findUnique({
            where: { user_id: userId}
        })
        if (providerExists) {
            throw new Error('Usuário já é um fornecedor');
        }

        await prisma.user.update({
            where: { user_id: userId},
            data: { role: "SUPPLIER" }
        })

        return this.repository.create(userId, data);
    }
}  