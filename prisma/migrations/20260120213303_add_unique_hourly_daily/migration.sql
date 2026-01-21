/*
  Warnings:

  - A unique constraint covering the columns `[user_id,day]` on the table `consumption_daily` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,hour]` on the table `consumption_hourly` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "consumption_daily_user_id_day_key" ON "consumption_daily"("user_id", "day");

-- CreateIndex
CREATE UNIQUE INDEX "consumption_hourly_user_id_hour_key" ON "consumption_hourly"("user_id", "hour");
