import { PrismaClient } from "@prisma/client";
import { CreateConsumptionEventDTO } from "../dtos/CreateConsumptionEventDTO";
import { CreatSensorReadingDTO } from "../dtos/CreatSensorReadingDTO";

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

    async getCurrent(user_id: string) {
        return prisma.consumption_current.findUnique({ where:{ user_id }});
    }

    async creatCurrent(data: CreatSensorReadingDTO) {
        return prisma.consumption_current.create({
            data: {
                user_id: data.user_id,
                weight_kg: data.weight_kg,
                percent: data.percent
            }
        });
    }

    async updateCurrent(data: CreatSensorReadingDTO) {
        return prisma.consumption_current.update({
            where: { user_id: data.user_id},
            data: {
                weight_kg: data.weight_kg,
                percent: data.percent
            }
        });
    }

    async saveHourly(user_id: string, used_kg: number) {
        return prisma.consumption_hourly.create({
            data: {
                user_id,
                hour: new Date(),
                used_kg
            }
        });
    }

    async saveDaily(user_id: string, used_kg: number) {
        return prisma.consumption_daily.create({
            data: {
                user_id,
                day: new Date(),
                used_kg
            }
        });
    }
}