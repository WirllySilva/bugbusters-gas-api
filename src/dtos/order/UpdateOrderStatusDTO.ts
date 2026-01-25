export type OrderStatus = "PENDING" | "ACCEPTED" | "IN_TRANSIT" | "DELIVERED" | "PICKED_UP" | "CANCELLED";

export interface UpdateOrderStatusDTO {
  status: Exclude<OrderStatus, "PENDING" | "ACCEPTED" | "CANCELLED">; 
}
