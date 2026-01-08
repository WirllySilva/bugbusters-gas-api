import { CreateConsumptionEventDTO } from "../dtos/CreateConsumptionEventDTO";
import { CreatSensorReadingDTO } from "../dtos/CreatSensorReadingDTO";
import { ConsumptionEventRepository } from "../repositories/ConsumptionEventRepository";
import { ConsumptionEventType } from "@prisma/client";

export class ConsumptionService {
    constructor(private readonly repository: ConsumptionEventRepository) {

    }

    private isFirstReadingOfDay(date: Date): boolean {
        const now = new Date();
        return(date.getDate() !== now.getDate() || date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear());
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
}