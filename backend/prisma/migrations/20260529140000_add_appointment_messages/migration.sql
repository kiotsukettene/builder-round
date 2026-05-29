-- CreateEnum
CREATE TYPE "MessageAuthorRole" AS ENUM ('PATIENT', 'DOCTOR');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_MESSAGE';

-- CreateTable
CREATE TABLE "AppointmentMessage" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "authorRole" "MessageAuthorRole" NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppointmentMessage_appointmentId_createdAt_idx" ON "AppointmentMessage"("appointmentId", "createdAt");

-- AddForeignKey
ALTER TABLE "AppointmentMessage" ADD CONSTRAINT "AppointmentMessage_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing appointment notes into message thread
INSERT INTO "AppointmentMessage" ("id", "appointmentId", "authorRole", "authorUserId", "body", "createdAt")
SELECT
    'migrated_' || a."id",
    a."id",
    'PATIENT'::"MessageAuthorRole",
    p."userId",
    a."notes",
    a."createdAt"
FROM "Appointment" a
JOIN "Patient" p ON p."id" = a."patientId"
WHERE a."notes" IS NOT NULL AND TRIM(a."notes") <> '';
