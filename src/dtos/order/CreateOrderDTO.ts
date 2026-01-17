export type DeliveryType = "DELIVERY" | "PICKUP";

export interface CreateOrderDTO {
  supplier_id: string;
  delivery_type: DeliveryType;
  address_id?: string;
  notes?: string;
}
