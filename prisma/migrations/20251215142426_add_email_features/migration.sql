-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('PAYMENT_REMINDER', 'OVERDUE_REMINDER', 'MONTHLY_BILL', 'SYSTEM_NOTIFICATION', 'TEST_EMAIL');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'RETRYING');

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "email_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "smtpUser" TEXT NOT NULL,
    "smtpPassword" TEXT NOT NULL,
    "fromName" TEXT NOT NULL DEFAULT '租金跟踪系统',
    "fromEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "paymentReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "paymentReminderDays" INTEGER NOT NULL DEFAULT 3,
    "overdueReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "monthlyBillEnabled" BOOLEAN NOT NULL DEFAULT true,
    "systemNotificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_logs_toEmail_idx" ON "email_logs"("toEmail");

-- CreateIndex
CREATE INDEX "email_logs_type_idx" ON "email_logs"("type");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "email_logs_sentAt_idx" ON "email_logs"("sentAt");

-- AddForeignKey
ALTER TABLE "email_config" ADD CONSTRAINT "email_config_id_fkey" FOREIGN KEY ("id") REFERENCES "settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
