export type OrderStatus = "PENDING" | "ACCEPTED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export interface UpdateOrderStatusDTO {
  status: Exclude<OrderStatus, "PENDING" | "ACCEPTED" | "CANCELLED">; 
}
