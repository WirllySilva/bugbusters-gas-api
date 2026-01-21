import { CreateConsumptionEventDTO } from "../dtos/CreateConsumptionEventDTO";
import { CreatSensorReadingDTO } from "../dtos/CreatSensorReadingDTO";
import { ConsumptionEventRepository } from "../repositories/ConsumptionEventRepository";
import { ConsumptionEventType } from "@prisma/client";
import { ConsumptionCurrentRepository } from "../repositories/ConsumptionCurrentRepository";
import { ConsumptionRepository } from "../repositories/ConsumptionRepository";

function startOfDayUTC(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
}

function endOfDayUTC(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0));
}

function startOfMonthUTC(year: number, month: number) {
    return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
}

function startOfNextMonthUTC(year: number, month: number) {
    return new Date(Date.UTC(year, month, 1, 0, 0, 0))
}

function hourBucketUTC(date: Date) {
    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        0, 0, 0
    ));
}

function dayBucketUTC(date: Date) {
    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0, 0, 0, 0
    ));
}

export class ConsumptionService {
    constructor(
        private readonly eventRepository: ConsumptionEventRepository,
        private readonly currentRepository: ConsumptionCurrentRepository,
        private readonly repository: ConsumptionRepository) {
    }

    // esse método assinc vai registrar um evento de consumo.
    async registerEvent(data: CreatSensorReadingDTO) {
        const last = await this.eventRepository.findLastByUser(data.user_id);

        let event: ConsumptionEventType | null = null;


        // algumas condições da nossa regra de negócio.
        if (data.percent <= 5) {
            event = "CRITICAL_LEVEL";
        } else if (data.percent <= 20) {
            event = "LOW_LEVEL";
        }

        if ((!last || this.isFirstReadingOfDay(last.created_at)) && !event) {
            event = "DAILY_BASELINE";
        }

        if (!event) {
            return null;
        }

        if (last?.event === event) {
            return null;
        }

        const payload: CreateConsumptionEventDTO = {
            ...data, event
        }

        return this.eventRepository.save(payload);
    }

    private isFirstReadingOfDay(date: Date): boolean {
        const now = new Date();
        return (date.getDate() !== now.getDate() || date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear());
    }

    async processReading(data: CreatSensorReadingDTO) {
        const current = await this.currentRepository.getCurrent(data.user_id);

        if (!current) {
            await this.currentRepository.creatCurrent(data);
            return;
        }

        const diffUp = data.weight_kg - current.weight_kg;

        if (diffUp > 1) {
            await this.currentRepository.updateCurrent(data);

            await this.eventRepository.save({
                user_id: data.user_id,
                weight_kg: data.weight_kg,
                percent: data.percent,
                event: "CYLINDER_REPLACED"
            });

            console.log(`[SERVICE] Cylinder replaced detected for user ${data.user_id}`);
            return;
        }

        const used = current.weight_kg - data.weight_kg;
        if (used <= 0) {
            return;
        }

        const now = new Date();
        const hourBucket = hourBucketUTC(now);
        const dayBucket = dayBucketUTC(now);

        await this.currentRepository.updateCurrent(data);
        await this.currentRepository.upsertHourly(data.user_id, hourBucket, used);
        await this.currentRepository.upsertDaily(data.user_id, dayBucket, used);


    }

    async getDailyHistory(usedId: string, dateStr: string, withDetails = true) {
        const date = new Date(`${dateStr}T00:00:00.000Z`);
        if (Number.isNaN(date.getTime())) {
            throw new TypeError("Invalid date. Use YYYY-MM-DD");
        }

        const start = startOfDayUTC(date);
        const end = endOfDayUTC(date);

        const rows = await this.repository.listHourlyByDay(usedId, start, end);
        const total = rows.reduce((acc, r) => acc + Number(r.used_kg || 0), 0);

        return {
            date: dateStr,
            total_used_kg: Number(total.toFixed(3)),
            ...(withDetails
                ? {
                    hours: rows.map((r) => ({
                        hour: r.hour,
                        used_kg: r.used_kg,
                    })),
                }
                : {}),
        };
    }

    async getMonthlyHistory(userId: string, monthStr: string) {
        if (!/^\d{4}-\d{2}$/.test(monthStr)) throw new Error("Invalid month");

        const [y, m] = monthStr.split("-").map(Number);
        const start = startOfMonthUTC(y, m);
        const end = startOfNextMonthUTC(y, m);

        const days = await this.repository.listDailyByMonth(userId, start, end);

        const total = days.reduce((acc, d) => acc + Number(d.used_kg || 0), 0);

        return {
            month: monthStr,
            total_used_kg: Number(total.toFixed(3)),
            days: days.map((d) => ({
                day: d.day,
                used_kg: d.used_kg,
            })),
        };
    }


    private isNewHour(lastHour?: Date) {
        if (!lastHour) {
            return true;
        }

        const now = new Date();
        return (
            now.getHours() !== lastHour.getHours() ||
            now.getDate() !== lastHour.getDate()
        );
    }

    private isNewDay(lastDay?: Date) {
        if (!lastDay) {
            return true;
        }

        const now = new Date();
        return (
            now.getDate() !== lastDay.getDate() ||
            now.getMonth() !== lastDay.getMonth() ||
            now.getFullYear() !== lastDay.getFullYear()
        );
    }


}