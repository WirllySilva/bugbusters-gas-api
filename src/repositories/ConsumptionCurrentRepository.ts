import { prisma } from "../database/prisma";
import { CreatSensorReadingDTO } from "../dtos/CreatSensorReadingDTO";


export class ConsumptionCurrentRepository {
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

    async findLastHourly(user_id: string) {
        return prisma.consumption_hourly.findFirst({
            where: { user_id },
            orderBy: { hour: "desc" }
        });
    }

    async findLastDaily(user_id: string) {
        return prisma.consumption_daily.findFirst({
            where: { user_id },
            orderBy: { day: "desc"}
        });
    }
}