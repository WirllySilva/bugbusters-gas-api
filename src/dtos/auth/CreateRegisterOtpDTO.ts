import type { role } from "@prisma/client";

export interface CreateRegisterOtpDTO {
  phone: string;
  role: role;
}
