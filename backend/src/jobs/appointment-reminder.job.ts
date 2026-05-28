import prisma from "../lib/prisma.js";
import { sendNotification } from "../lib/notification.js";
import { formatAppointmentDateTime } from "../utils/schedule-datetime.js";

const ONE_HOUR_MS = 60 * 60 * 1000;
const TEN_MIN_MS = 10 * 60 * 1000;
const TOLERANCE_MS = 60 * 1000;

const appointmentInclude = {
  patient: { include: { user: { select: { id: true } } } },
  doctor: { include: { user: { select: { id: true } } } },
} as const;

async function notifyBothParties(
  appointment: {
    id: string;
    scheduledAt: Date;
    patient: { user: { id: string } };
    doctor: { user: { id: string } };
  },
  title: string,
  message: string,
): Promise<void> {
  const { id, patient, doctor } = appointment;
  await Promise.all([
    sendNotification({
      userId: patient.user.id,
      type: "APPOINTMENT_REMINDER",
      title,
      message,
      relatedId: id,
    }),
    sendNotification({
      userId: doctor.user.id,
      type: "APPOINTMENT_REMINDER",
      title,
      message,
      relatedId: id,
    }),
  ]);
}

async function processOneHourReminders(now: Date): Promise<void> {
  const target = now.getTime() + ONE_HOUR_MS;
  const from = new Date(target - TOLERANCE_MS);
  const to = new Date(target + TOLERANCE_MS);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      reminderOneHourSentAt: null,
      scheduledAt: { gte: from, lte: to },
    },
    include: appointmentInclude,
  });

  for (const appointment of appointments) {
    const when = formatAppointmentDateTime(appointment.scheduledAt);
    await notifyBothParties(
      appointment,
      "Consultation in 1 hour",
      `Your consultation is scheduled for ${when}. You can join the session 10 minutes before the start time.`,
    );
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { reminderOneHourSentAt: now },
    });
  }
}

async function processTenMinReminders(now: Date): Promise<void> {
  const target = now.getTime() + TEN_MIN_MS;
  const from = new Date(target - TOLERANCE_MS);
  const to = new Date(target + TOLERANCE_MS);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      reminderTenMinSentAt: null,
      scheduledAt: { gte: from, lte: to },
    },
    include: appointmentInclude,
  });

  for (const appointment of appointments) {
    const when = formatAppointmentDateTime(appointment.scheduledAt);
    await notifyBothParties(
      appointment,
      "Consultation starts in 10 minutes",
      `Your consultation starts at ${when}. You can join the session now.`,
    );
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { reminderTenMinSentAt: now },
    });
  }
}

export async function runAppointmentReminderJob(): Promise<void> {
  const now = new Date();
  await processOneHourReminders(now);
  await processTenMinReminders(now);
}

export function startAppointmentReminderJob(): void {
  const INTERVAL_MS = 60 * 1000;

  void runAppointmentReminderJob();

  setInterval(() => {
    void runAppointmentReminderJob().catch((err) => {
      console.error("Appointment reminder job failed:", err);
    });
  }, INTERVAL_MS);
}
