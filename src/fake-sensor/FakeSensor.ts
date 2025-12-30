import axios from "axios";

export interface SensorReading {
  currentWeight: number;
  percentageRemaining: number;
  timestamp: Date;
}

export class FakeSensor {
    private readonly initialWeight: number;
    private currentWeight: number;
    private readonly minConsumptionPerCycle: number;
    private readonly maxConsumptionPerCycle: number;

    constructor(initialWeight: number, minConsumptionPerCycle = 0.02, maxConsumptionPerCycle = 0.08) {
        this.initialWeight = initialWeight;
        this.currentWeight = initialWeight;
        this.minConsumptionPerCycle = minConsumptionPerCycle;
        this.maxConsumptionPerCycle = maxConsumptionPerCycle;
    }

    private generateConsumption(): number {
        const range = this.maxConsumptionPerCycle - this.minConsumptionPerCycle; // Variavel recebe o resultado da subtração de consumo max e min. é usa depois para termos um range do consumo. 
        const randomFactor = Math.random(); // gera um valor aleatório  entre 0 e 1.
        return (randomFactor * range) + this.minConsumptionPerCycle; // Esse retorno será o valor aleatório mas dentro do range e nosso sensor vai consumir.
    }

    //Consumo aleatório do gás, usando nosso metodo de gerador de cosumo.
    private reduceWeight(): void { 
        const consumption = this.generateConsumption(); // Recebe o valor aleatório da nossa funçao
        this.currentWeight -= consumption;

        if (this.currentWeight < 0) { // Nosso peso atual nunca será abaixo de zero pois nosso controle não deixa.
            this.currentWeight = 0;
        }
    }

    //Vamos transformar o peso atual em porcentagem
    private calculatePercentageRemaining(): number {
        return Number(
            ((this.currentWeight / this.initialWeight) * 100).toFixed(2)
        );
    }

    //Faz a leitura aleatória e retorna um objeto com os principais atributos
    public getReading(): SensorReading {
        this.reduceWeight();

        return {
            currentWeight: Number(this.currentWeight.toFixed(3)),
            percentageRemaining: this.calculatePercentageRemaining(),
            timestamp: new Date(),
        }
    }

    //Envia a leitura para a API
    public async sendReading(): Promise<void> {
        const reading = this.getReading();

        console.log(`[FakeSensor] Sending reading -> Weight: ${reading.currentWeight}kg | Remaining: ${reading.percentageRemaining}%`);

        try {
            await axios.post("http://localhost:3000/consumption/read", reading);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("[FakeSensor] Error:", error.message);
            } else {
                console.error("[FakeSensor] Unknown error:", error);
            }
        }
    }
}