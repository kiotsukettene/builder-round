-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'MISSED';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_WINDOW_PASSED';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "sessionWindowPassedNotifiedAt" TIMESTAMP(3);
