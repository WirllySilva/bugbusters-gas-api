/*
  Warnings:

  - Changed the type of `type` on the `alert` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LEAK', 'HIGH_CONSUMPTION', 'SENSOR_OFFLINE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "alert" ADD COLUMN     "metadata" JSONB,
DROP COLUMN "type",
ADD COLUMN     "type" "AlertType" NOT NULL;

-- DropEnum
DROP TYPE "type";

-- CreateTable
CREATE TABLE "notification" (
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "template" TEXT,
    "title" TEXT,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "external_id" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "device_token" (
    "device_token_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3),

    CONSTRAINT "device_token_pkey" PRIMARY KEY ("device_token_id")
);

-- CreateIndex
CREATE INDEX "notification_user_id_idx" ON "notification"("user_id");

-- CreateIndex
CREATE INDEX "notification_status_idx" ON "notification"("status");

-- CreateIndex
CREATE INDEX "notification_channel_idx" ON "notification"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "device_token_token_key" ON "device_token"("token");

-- CreateIndex
CREATE INDEX "device_token_user_id_idx" ON "device_token"("user_id");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_token" ADD CONSTRAINT "device_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
