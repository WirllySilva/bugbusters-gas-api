import { CreateConsumptionEventDTO } from "../dtos/CreateConsumptionEventDTO";
import { CreatSensorReadingDTO } from "../dtos/CreatSensorReadingDTO";
import { ConsumptionEventRepository } from "../repositories/ConsumptionEventRepository";
import { ConsumptionEventType } from "@prisma/client";

export class ConsumptionService {
    constructor(private readonly repository: ConsumptionEventRepository) {

    }
        
    // esse método assinc vai registrar um evento de consumo.
    async registerEvent(data: CreatSensorReadingDTO) {
        const last = await this.repository.findLastByUser(data.user_id);

        let event: ConsumptionEventType | null = null;     


        // algumas condições da nossa regra de negócio.
        if (data.percent <= 5) {
            event = "CRITICAL_LEVEL";
        } else if (data.percent <= 20) {
            event = "LOW_LEVEL";
        }

        if (!last || this.isFirstReadingOfDay(last.created_at)) {
            event = "DAILY_BASELINE";
        }

        if (!event) {
            return null;
        }

        const payload: CreateConsumptionEventDTO = {
            ...data, event
        }

        return this.repository.save(payload);
    }

    private isFirstReadingOfDay(date: Date): boolean {
        const now = new Date();
        return(date.getDate() !== now.getDate() || date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear());
    }

    async processReading(data: CreatSensorReadingDTO) {
        const current = await this.repository.getCurrent(data.user_id);

        if(!current) {
            await this.repository.creatCurrent(data);
            return;
        }

        const used = current.weight_kg - data.weight_kg;
        if(used <= 0) {
            return;
        }

        await this.repository.updateCurrent(data);

        if(this.isNewHour(current.updated_at)) {
            await this.repository.saveHourly(data.user_id, used);
        }

        if(this.isNewDay(current.updated_at)) {
            await this.repository.saveDaily(data.user_id, used);
        }
    }

    // método simples pra pegar a hora de um Date
    private isNewHour(date: Date) {
        return new Date().getHours() !== date.getHours();
    }

    private isNewDay(date: Date) {
        return new Date().getDay() !== date.getDay();
    }


}