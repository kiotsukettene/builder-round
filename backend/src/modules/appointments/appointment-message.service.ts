import { AppError } from "../../errors/app-error.js";
import { emitAppointmentMessage } from "../../lib/appointment-message.js";
import { sendNotification } from "../../lib/notification.js";
import { formatAppointmentDateTime } from "../../utils/schedule-datetime.js";
import * as appointmentRepository from "./appointment.repository.js";
import * as messageRepository from "./appointment-message.repository.js";
import { toAppointmentMessageDto } from "./appointment-message.utils.js";
import type { SendAppointmentMessageInput } from "./appointment-message.validation.js";

async function getAppointmentOrThrow(id: string) {
  const appointment = await appointmentRepository.findAppointmentById(id);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  return appointment;
}

function assertAppointmentAccess(
  appointment: Awaited<ReturnType<typeof getAppointmentOrThrow>>,
  userId: string,
  role: string,
): "PATIENT" | "DOCTOR" {
  const isPatient = role === "PATIENT" && appointment.patient.userId === userId;
  const isDoctor = role === "DOCTOR" && appointment.doctor.userId === userId;

  if (!isPatient && !isDoctor) {
    throw new AppError("You do not have access to this appointment", 403);
  }

  return isPatient ? "PATIENT" : "DOCTOR";
}

export async function listAppointmentMessages(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);
  assertAppointmentAccess(appointment, userId, role);

  const messages =
    await messageRepository.findMessagesByAppointmentId(appointmentId);

  return messages.map(toAppointmentMessageDto);
}

export async function sendAppointmentMessage(
  userId: string,
  role: string,
  appointmentId: string,
  input: SendAppointmentMessageInput,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);
  const authorRole = assertAppointmentAccess(appointment, userId, role);

  if (appointment.status === "CANCELLED") {
    throw new AppError(
      "Cannot send messages on a cancelled appointment",
      403,
    );
  }

  const message = await messageRepository.createMessage({
    appointmentId,
    authorRole,
    authorUserId: userId,
    body: input.body,
  });

  const notifyUserId =
    authorRole === "PATIENT"
      ? appointment.doctor.user.id
      : appointment.patient.user.id;

  const notifyMessage =
    authorRole === "PATIENT"
      ? `${appointment.patient.firstName} ${appointment.patient.lastName} sent a message about your appointment on ${formatAppointmentDateTime(appointment.scheduledAt)}.`
      : `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} replied about your appointment on ${formatAppointmentDateTime(appointment.scheduledAt)}.`;

  await sendNotification({
    userId: notifyUserId,
    type: "APPOINTMENT_MESSAGE",
    title: "New Appointment Message",
    message: notifyMessage,
    relatedId: appointment.id,
  });

  const messageDto = toAppointmentMessageDto(message);

  emitAppointmentMessage(
    appointment.patient.user.id,
    appointment.doctor.user.id,
    messageDto,
  );

  return messageDto;
}
