/*
  Warnings:

  - You are about to drop the `consumption_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "consumption_history" DROP CONSTRAINT "consumption_history_user_id_fkey";

-- DropIndex
DROP INDEX "address_user_id_idx";

-- AlterTable
ALTER TABLE "consumption_current" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "consumption_event" ALTER COLUMN "created_at" DROP DEFAULT;

-- DropTable
DROP TABLE "consumption_history";

-- CreateIndex
CREATE INDEX "consumption_current_user_id_idx" ON "consumption_current"("user_id");

-- CreateIndex
CREATE INDEX "consumption_daily_user_id_day_idx" ON "consumption_daily"("user_id", "day");

-- CreateIndex
CREATE INDEX "consumption_hourly_user_id_hour_idx" ON "consumption_hourly"("user_id", "hour");

-- AddForeignKey
ALTER TABLE "consumption_current" ADD CONSTRAINT "consumption_current_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumption_hourly" ADD CONSTRAINT "consumption_hourly_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumption_daily" ADD CONSTRAINT "consumption_daily_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
