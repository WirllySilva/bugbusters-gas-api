import type { role } from "@prisma/client";

export interface VerifyRegisterOtpDTO {
  phone: string;
  otp_code: string;
  role: role;
}
