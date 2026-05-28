-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "reminderOneHourSentAt" TIMESTAMP(3),
ADD COLUMN "reminderTenMinSentAt" TIMESTAMP(3);
