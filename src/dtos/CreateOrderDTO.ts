import { delivery_type } from "@prisma/client";

export interface CreateOrderDTO {
    supplier_id: string;
    adress_id: string;
    delivery_type: delivery_type;
    notes: string;
}