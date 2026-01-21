import { prisma } from "../database/prisma";
import { CreatSensorReadingDTO } from "../dtos/CreatSensorReadingDTO";


export class ConsumptionCurrentRepository {
    async getCurrent(user_id: string) {
        return prisma.consumption_current.findUnique({ where: { user_id } });
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
            where: { user_id: data.user_id },
            data: {
                weight_kg: data.weight_kg,
                percent: data.percent
            }
        });
    }

    async upsertHourly(user_id: string, hour: Date, used_kg: number) {
        return prisma.consumption_hourly.upsert({
            where: { user_id_hour: { user_id, hour } },
            create: { user_id, hour, used_kg },
            update: { used_kg: { increment: used_kg } }
        });
    }

    async upsertDaily(user_id: string, day: Date, used_kg: number) {
        return prisma.consumption_daily.upsert({
            where: { user_id_day: { user_id, day } },
            create: { user_id, day, used_kg },
            update: { used_kg: { increment: used_kg } }
        });
    }
}