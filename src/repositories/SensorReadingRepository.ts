import { PrismaClient } from "@prisma/client";
import { CreateSensorReadingDTO } from "../dtos/CreateSensorReadingDTO";

const prisma = new PrismaClient();


export class SensorReadingRepository {
    async save(data: CreateSensorReadingDTO) {  
        return prisma.sensor_reading.create({
            data: {
                user_id: data.user_id,
                weight_kg: data.weight_kg,
                percent: data.percent
            },
        });
    }
}