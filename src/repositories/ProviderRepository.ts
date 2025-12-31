import { prisma } from "../database/prisma"
import { CreateProviderDTO } from "../dtos/CreateProviderDTO"

// Classe responsável por acessar dados do fornecedor.
export class ProviderRepository {
    async create (userId: string, data: CreateProviderDTO) {
        return prisma.supplier_info.create({
            data: {
                user_id: userId,
                payment_methods: data.payment_methods,
                open_time: data.open_time,
                close_time: data.close_time,
                open_days: data.open_days,
                deliveryTimes: data.deliveryTimes,
                is_active: true
            }
        })
    }
}
