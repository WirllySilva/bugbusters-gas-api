import { PrismaClient } from "@prisma/client";
import { CreateConsumptionEventDTO } from "../dtos/CreateConsumptionEventDTO";

const prisma = new PrismaClient();

export class ConsumptionEventRepository {
    async save(data: CreateConsumptionEventDTO) {  
        return prisma.consumption_event.create({
            data: {
                user_id: data.user_id,
                weight_kg: data.weight_kg,
                percent: data.percent,
                event: data.event
            },
        });
    }

    async findLastByUser(user_id: string) {
        return prisma.consumption_event.findFirst({
            where: { user_id },
            orderBy: { created_at: "desc"}
        });
    }
}