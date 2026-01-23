    import axios from "axios";

    export interface SensorReading {
        user_id: string;
        weight_kg: number;
        percent: number;
        created_at: Date;
    }

    export class FakeSensor {
        private readonly user_id: string;
        private readonly initialWeight: number;
        private currentWeight: number;
        private readonly minConsumptionPerCycle: number;
        private readonly maxConsumptionPerCycle: number;

        constructor(user_id: string, initialWeight: number, minConsumptionPerCycle = 0.02, maxConsumptionPerCycle = 0.08) {
            this.user_id = user_id;
            this.initialWeight = initialWeight;
            this.currentWeight = initialWeight;
            this.minConsumptionPerCycle = minConsumptionPerCycle;
            this.maxConsumptionPerCycle = maxConsumptionPerCycle;
        }

        // método pra gerar o valor que será consumido
        private generateConsumption(): number {
            const range = this.maxConsumptionPerCycle - this.minConsumptionPerCycle; // Variavel recebe o resultado da subtração de consumo max e min. é usa depois para termos um range do consumo. 
            const randomFactor = Math.random(); // gera um valor aleatório  entre 0 e 1.
            return (randomFactor * range) + this.minConsumptionPerCycle; // Esse retorno será o valor aleatório mas dentro do range e nosso sensor vai consumir.
        }

        //Consumo aleatório do gás, usando nosso metodo de gerador de cosumo.
        private reduceWeight(): void {
            const consumption = this.generateConsumption(); // Recebe o valor aleatório da nossa funçao generate
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
                user_id: this.user_id,
                weight_kg: Number(this.currentWeight.toFixed(3)),
                percent: this.calculatePercentageRemaining(),
                created_at: new Date(),
            }
        }

        //Envia a leitura para a API
        public async sendReading(): Promise<void> {
            const reading = this.getReading();

            console.log(`[FakeSensor] Sending reading -> User: ${reading.user_id} | Weight: ${reading.weight_kg}kg | Remaining: ${reading.percent}% | Created: ${reading.created_at}`);

            try {
                await axios.post("http://localhost:3000/api/consumption/sensor-readings", {
                    user_id: reading.user_id,
                    weight_kg: reading.weight_kg,
                    percent: reading.percent,
                    created_at: reading.created_at
                },
                    {
                        headers: {
                            "x-sensor-key": process.env.SENSOR_API_KEY ?? ""
                        }
                    }
                );
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("[FakeSensor] Error:", error.message);
                } else {
                    console.error("[FakeSensor] Unknown error:", error);
                }
            }
        }
    }