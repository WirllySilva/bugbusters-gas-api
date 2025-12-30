import { CreatConsumptionDTO } from "../dtos/CreateConsumptionDTO";
import { ConsumptionRecord } from "../entities/ConsumptionRecord";


export class ConsumptionRepository {
    async save(data: CreatConsumptionDTO): Promise<ConsumptionRecord> {  // Esse método assinc, ele recebe um DTO do nosso consumption e retorna nosso promise que vai ser do tipo consumptionrecord.
        const record = new ConsumptionRecord(); // instância da nossa entidade de gravação (ConsumptionRecord) :)

        record.currentWeight = data.currentWeight; // Aqui nós copiamos os valores do DTO para a entidade é basicamente uma transferencia de dados.
        record.percentageRemaining = data.percentageRemaining;
        record.timestamp = data.timestamp; // quando o consumo foi medido
        record.createdAt = new Date();  // quando o registro foi criado

        console.log("[Repository] Saving record:", record); // só pra simular um salvamento, pra ver algo no console.

        return record;
    }
}