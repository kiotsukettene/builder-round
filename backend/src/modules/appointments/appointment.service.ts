import { AppError } from "../../errors/app-error.js";
import { sendNotification } from "../../lib/notification.js";
import * as appointmentRepository from "./appointment.repository.js";
import * as patientRepository from "../patients/patient.repository.js";
import * as doctorRepository from "../doctors/doctor.repository.js";
import { toAppointmentDto } from "./appointment.utils.js";
import type {
  BookAppointmentInput,
  ListAppointmentsQueryInput,
  RescheduleAppointmentInput,
} from "./appointment.validation.js";

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED"] as const;
const RESCHEDULABLE_STATUSES = ["PENDING", "CONFIRMED"] as const;

function isTimeWithinAvailability(
  scheduledAt: Date,
  availabilities: { dayOfWeek: number; startTime: string; endTime: string }[],
): boolean {
  const dayOfWeek = scheduledAt.getUTCDay();
  const hours = scheduledAt.getUTCHours().toString().padStart(2, "0");
  const minutes = scheduledAt.getUTCMinutes().toString().padStart(2, "00");
  const timeStr = `${hours}:${minutes}`;

  return availabilities.some((slot) => {
    if (slot.dayOfWeek !== dayOfWeek) return false;
    return timeStr >= slot.startTime && timeStr < slot.endTime;
  });
}

async function getPatientOrThrow(userId: string) {
  const patient = await patientRepository.findPatientByUserId(userId);
  if (!patient) {
    throw new AppError("Patient profile not found", 404);
  }

  return patient;
}

async function getDoctorWithAvailabilityOrThrow(doctorId: string) {
  const doctor = await doctorRepository.findDoctorById(doctorId);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  return doctor;
}

async function getAppointmentOrThrow(id: string) {
  const appointment = await appointmentRepository.findAppointmentById(id);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  return appointment;
}

export async function bookAppointment(
  patientUserId: string,
  input: BookAppointmentInput,
) {
  const patient = await getPatientOrThrow(patientUserId);
  const doctor = await getDoctorWithAvailabilityOrThrow(input.doctorId);

  const scheduledAt = new Date(input.scheduledAt);

  if (!isTimeWithinAvailability(scheduledAt, doctor.availabilities)) {
    throw new AppError(
      "The requested time slot is outside the doctor's availability",
      400,
    );
  }

  const conflict = await appointmentRepository.findConflictingAppointment(
    doctor.id,
    scheduledAt,
  );
  if (conflict) {
    throw new AppError(
      "This time slot is already booked. Please choose another time.",
      409,
    );
  }

  const appointment = await appointmentRepository.createAppointment({
    patientId: patient.id,
    doctorId: doctor.id,
    scheduledAt,
  });

  await sendNotification({
    userId: appointment.doctor.user.id,
    type: "APPOINTMENT_BOOKED",
    title: "New Appointment Booked",
    message: `${patient.firstName} ${patient.lastName} has booked an appointment on ${scheduledAt.toUTCString()}.`,
    relatedId: appointment.id,
  });

  return toAppointmentDto(appointment);
}

export async function cancelAppointment(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  const isPatient = role === "PATIENT" && appointment.patient.userId === userId;
  const isDoctor = role === "DOCTOR" && appointment.doctor.userId === userId;

  if (!isPatient && !isDoctor) {
    throw new AppError("You do not have permission to cancel this appointment", 403);
  }

  if (
    !CANCELLABLE_STATUSES.includes(
      appointment.status as (typeof CANCELLABLE_STATUSES)[number],
    )
  ) {
    throw new AppError(
      `Cannot cancel an appointment with status ${appointment.status}`,
      400,
    );
  }

  const updated = await appointmentRepository.updateAppointmentStatus(
    appointmentId,
    "CANCELLED",
  );

  const notifyUserId = isPatient
    ? appointment.doctor.user.id
    : appointment.patient.user.id;

  const notifyName = isPatient
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
    : `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

  await sendNotification({
    userId: notifyUserId,
    type: "APPOINTMENT_CANCELLED",
    title: "Appointment Cancelled",
    message: `Your appointment on ${appointment.scheduledAt.toUTCString()} has been cancelled by ${notifyName}.`,
    relatedId: appointment.id,
  });

  return toAppointmentDto(updated);
}

export async function rescheduleAppointment(
  patientUserId: string,
  appointmentId: string,
  input: RescheduleAppointmentInput,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  if (appointment.patient.userId !== patientUserId) {
    throw new AppError(
      "You do not have permission to reschedule this appointment",
      403,
    );
  }

  if (
    !RESCHEDULABLE_STATUSES.includes(
      appointment.status as (typeof RESCHEDULABLE_STATUSES)[number],
    )
  ) {
    throw new AppError(
      `Cannot reschedule an appointment with status ${appointment.status}`,
      400,
    );
  }

  const scheduledAt = new Date(input.scheduledAt);
  const doctor = await getDoctorWithAvailabilityOrThrow(appointment.doctor.id);

  if (!isTimeWithinAvailability(scheduledAt, doctor.availabilities)) {
    throw new AppError(
      "The requested time slot is outside the doctor's availability",
      400,
    );
  }

  const conflict = await appointmentRepository.findConflictingAppointment(
    appointment.doctor.id,
    scheduledAt,
    appointmentId,
  );

  if (conflict) {
    throw new AppError(
      "This time slot is already booked. Please choose another time.",
      409,
    );
  }

  const updated = await appointmentRepository.updateAppointmentSchedule(
    appointmentId,
    scheduledAt,
  );

  await sendNotification({
    userId: appointment.doctor.user.id,
    type: "SCHEDULE_UPDATED",
    title: "Appointment Rescheduled",
    message: `${appointment.patient.firstName} ${appointment.patient.lastName} has rescheduled their appointment to ${scheduledAt.toUTCString()}.`,
    relatedId: appointment.id,
  });

  return toAppointmentDto(updated);
}

export async function getMyAppointments(
  userId: string,
  role: string,
  query: ListAppointmentsQueryInput,
) {
  const { page, limit } = query;

  if (role === "PATIENT") {
    const patient = await getPatientOrThrow(userId);
    const { appointments, total } =
      await appointmentRepository.findAppointmentsByPatientId(
        patient.id,
        query,
      );

    return {
      data: appointments.map(toAppointmentDto),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  const doctor = await doctorRepository.findDoctorByUserId(userId);
  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  const { appointments, total } =
    await appointmentRepository.findAppointmentsByDoctorId(doctor.id, query);

  return {
    data: appointments.map(toAppointmentDto),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAppointmentById(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  const isPatient = role === "PATIENT" && appointment.patient.userId === userId;
  const isDoctor = role === "DOCTOR" && appointment.doctor.userId === userId;

  if (!isPatient && !isDoctor) {
    throw new AppError("You do not have access to this appointment", 403);
  }

  return toAppointmentDto(appointment);
}
