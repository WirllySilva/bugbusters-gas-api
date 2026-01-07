import cron from "node-cron";
import { user } from "@prisma/client";
import { prisma } from "../database/prisma";
import { FakeSensor } from "./FakeSensor";

export class FakeSensorRunner {
    public async start(): Promise<void> {
        console.log("[FakeSensorRunner] Scheduler started."); // Logzinho pra vermos o programa rodando no terminal.

        //variavel pra receber os users do db que tem o sensor ativo.
        const users: user[] = await prisma.user.findMany({
            where: { has_sensor: true}
        });

        // essa variável, vai usar esse map pra criar um objeto FakeSensor para cada item do do nosso array
        const sensors = users.map((user: user) => new FakeSensor(user.user_id, 13)); //Cilindo de 13 kilos


        // node cron fica responsavel por chamar nosso método de leitura a cada 1 minuto, 
        cron.schedule("*/1 * * * *", async () => {
            console.log(`[FakeSensorRunner] Running at ${new Date()}`);
            
           for(const sensor of sensors) {
            await sensor.sendReading();

           }
        });
    }
    
}