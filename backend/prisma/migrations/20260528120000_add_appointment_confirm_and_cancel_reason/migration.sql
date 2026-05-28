-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_CONFIRMED';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "cancellationReason" TEXT;
