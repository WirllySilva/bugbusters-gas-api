import { CreatConsumptionDTO } from "../dtos/CreateConsumptionDTO";
import { ConsumptionRepository } from "../repositories/ConsumptionRepository";

export class ConsumptionService {
    constructor(private readonly repository: ConsumptionRepository) {

    }

    // esse método assinc vai registrar o consumo.
    async registerConsumption(data: CreatConsumptionDTO) {
        const record = await this.repository.save(data);


        // algumas condições da nossa regra de negócio.
        if (data.percentageRemaining <= 5) {
            console.warn("CRITICAL ALERT: Gas level below 5%");
        } else if (data.percentageRemaining <= 20) {
            console.warn("WARNING: Gas level below 20%");
        }

        return record;
    }
}