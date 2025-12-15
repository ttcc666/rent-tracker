-- CreateTable
CREATE TABLE "system_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "password" TEXT NOT NULL,
    "isSetup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "paymentDay" INTEGER NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "electricityRate" DOUBLE PRECISION NOT NULL,
    "coldWaterRate" DOUBLE PRECISION NOT NULL,
    "hotWaterRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records" (
    "id" SERIAL NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "electricityUsage" DOUBLE PRECISION NOT NULL,
    "electricityCost" DOUBLE PRECISION NOT NULL,
    "coldWaterUsage" DOUBLE PRECISION NOT NULL,
    "coldWaterCost" DOUBLE PRECISION NOT NULL,
    "hotWaterUsage" DOUBLE PRECISION NOT NULL,
    "hotWaterCost" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "records_yearMonth_idx" ON "records"("yearMonth");

-- CreateIndex
CREATE INDEX "records_isPaid_idx" ON "records"("isPaid");

-- CreateIndex
CREATE UNIQUE INDEX "records_yearMonth_key" ON "records"("yearMonth");
