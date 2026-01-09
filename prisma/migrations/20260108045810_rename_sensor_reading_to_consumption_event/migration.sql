/*
  Warnings:

  - You are about to drop the `sensor_reading` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ConsumptionEventType" AS ENUM ('SIGNIFICANT_DROP', 'LOW_LEVEL', 'CRITICAL_LEVEL', 'CYLINDER_REPLACED', 'DAILY_BASELINE');

-- DropForeignKey
ALTER TABLE "sensor_reading" DROP CONSTRAINT "sensor_reading_user_id_fkey";

-- DropTable
DROP TABLE "sensor_reading";

-- CreateTable
CREATE TABLE "consumption_event" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "percent" DOUBLE PRECISION,
    "event" "ConsumptionEventType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumption_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consumption_event_user_id_idx" ON "consumption_event"("user_id");

-- AddForeignKey
ALTER TABLE "consumption_event" ADD CONSTRAINT "consumption_event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

