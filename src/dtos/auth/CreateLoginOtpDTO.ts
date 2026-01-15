import type { role } from "@prisma/client";

export interface CreateLoginOtpDTO {
  phone: string;
  role?: role;
}
