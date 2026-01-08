import { ConsumptionEventType } from "@prisma/client";

export interface CreateConsumptionEventDTO {
    user_id: string;
    weight_kg: number;
    percent: number;
    event: ConsumptionEventType
}