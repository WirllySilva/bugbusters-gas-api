import { prisma } from "../database/prisma";

export class ConsumptionRepository {
    
    async listHourlyByDay(userId: string, start: Date, end: Date) {
        return prisma.consumption_hourly.findMany({
            where: {
                user_id: userId,
                hour: {gte: start, lt: end},
            },
            orderBy: {hour: "asc"},
            select: {hour: true, used_kg: true},
        });
    }

    async listDailyByMonth(userId: string, start: Date, end: Date) {
        return prisma.consumption_daily.findMany({
            where: {
                user_id: userId,
                day: {gte: start, lt: end},
            },
            orderBy: {day: "asc"},
            select: {day: true, used_kg: true},
        });
    }
}