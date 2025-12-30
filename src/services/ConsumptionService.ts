import { CreateSensorReadingDTO } from "../dtos/CreateSensorReadingDTO";
import { SensorReadingRepository } from "../repositories/SensorReadingRepository";

export class ConsumptionService {
    constructor(private readonly repository: SensorReadingRepository) {

    }

    // esse método assinc vai registrar o consumo.
    async registerReading(data: CreateSensorReadingDTO) {
        const record = await this.repository.save(data);


        // algumas condições da nossa regra de negócio.
        if (data.percent <= 5) {
            console.warn("CRITICAL ALERT: Gas level below 5%");
        } else if (data.percent <= 20) {
            console.warn("WARNING: Gas level below 20%");
        }

        return record;
    }
}