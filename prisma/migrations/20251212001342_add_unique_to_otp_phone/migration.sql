/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `otp_code` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "otp_code_phone_idx";

-- CreateIndex
CREATE UNIQUE INDEX "otp_code_phone_key" ON "otp_code"("phone");
