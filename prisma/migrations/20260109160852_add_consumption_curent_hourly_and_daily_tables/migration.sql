-- CreateTable
CREATE TABLE "consumption_current" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumption_current_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumption_hourly" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "hour" TIMESTAMP(3) NOT NULL,
    "used_kg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "consumption_hourly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumption_daily" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "used_kg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "consumption_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consumption_current_user_id_key" ON "consumption_current"("user_id");
