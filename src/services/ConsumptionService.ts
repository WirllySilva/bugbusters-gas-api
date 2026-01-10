import { CreateConsumptionEventDTO } from "../dtos/CreateConsumptionEventDTO";
import { CreatSensorReadingDTO } from "../dtos/CreatSensorReadingDTO";
import { ConsumptionEventRepository } from "../repositories/ConsumptionEventRepository";
import { ConsumptionEventType } from "@prisma/client";
import { ConsumptionCurrentRepository } from "../repositories/ConsumptionCurrentRepository";

export class ConsumptionService {
    constructor(
        private readonly eventRepository: ConsumptionEventRepository, 
        private readonly currentRepository: ConsumptionCurrentRepository){
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

        const payload: CreateConsumptionEventDTO = {
            ...data, event
        }

        return this.eventRepository.save(payload);
    }

    private isFirstReadingOfDay(date: Date): boolean {
        const now = new Date();
        return(date.getDate() !== now.getDate() || date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear());
    }

    async processReading(data: CreatSensorReadingDTO) {
        const current = await this.currentRepository.getCurrent(data.user_id);

        if(!current) {
            await this.currentRepository.creatCurrent(data);
            return;
        }

        const diff = data.weight_kg - current.weight_kg;

        if(diff > 1) {
            await this.currentRepository.updateCurrent(data);

            await this.eventRepository.save({
                user_id: data.user_id,
                weight_kg: data.weight_kg,
                percent: data.percent,
                event: "CYLINDER_REPLACED"
            });

            console.log(`[SERVICE] Cylinder replaced detected for user ${data.user_id}`);
        }

        const used = current.weight_kg - data.weight_kg;
        if(used <= 0) {
            return;
        }

        await this.currentRepository.updateCurrent(data);

        const lastHourly = await this.currentRepository.findLastHourly(data.user_id);
        if(this.isNewHour(lastHourly?.hour)) {
            await this.currentRepository.saveHourly(data.user_id, used);
        }


        const lastDaily = await this.currentRepository.findLastDaily(data.user_id);
        if(this.isNewDay(lastDaily?.day)) {
            await this.currentRepository.saveDaily(data.user_id, used);
        }
    }


    private isNewHour(lastHour?: Date) {
        if(!lastHour) {
            return true;
        }

        const now = new Date();
        return(
            now.getHours() !== lastHour.getHours() ||
            now.getDate() !== lastHour.getDate()
        );
    }

    private isNewDay(lastDay?: Date) {
        if(!lastDay) {
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