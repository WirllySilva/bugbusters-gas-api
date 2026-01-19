export interface ListOrdersQueryDTO {
  status?: "PENDING" | "ACCEPTED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  take?: number;
  skip?: number;
}
