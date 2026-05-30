import { AppError } from "../../errors/app-error.js";
import * as appointmentRepository from "../appointments/appointment.repository.js";
import * as patientRepository from "../patients/patient.repository.js";
import * as doctorRepository from "../doctors/doctor.repository.js";
import * as medicalRecordRepository from "./medical-record.repository.js";
import type { ListMedicalRecordsQueryInput } from "./medical-record.validation.js";

async function getPatientOrThrow(userId: string) {
  const patient = await patientRepository.findPatientByUserId(userId);
  if (!patient) {
    throw new AppError("Patient profile not found", 404);
  }
  return patient;
}

async function getDoctorOrThrow(userId: string) {
  const doctor = await doctorRepository.findDoctorByUserId(userId);
  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }
  return doctor;
}

export async function listMedicalRecords(
  userId: string,
  role: string,
  query: ListMedicalRecordsQueryInput,
) {
  const { page, limit } = query;

  if (role === "PATIENT") {
    const patient = await getPatientOrThrow(userId);
    const { appointments, total } =
      await medicalRecordRepository.findCompletedAppointmentsByPatientId(
        patient.id,
        query,
      );

    return {
      data: appointments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  const doctor = await getDoctorOrThrow(userId);
  const { appointments, total } =
    await medicalRecordRepository.findCompletedAppointmentsByDoctorId(
      doctor.id,
      query,
    );

  return {
    data: appointments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMedicalRecordDetail(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment =
    await medicalRecordRepository.findAppointmentWithFullRecord(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  const isPatient =
    role === "PATIENT" && appointment.patient.user.id === userId;
  const isDoctor = role === "DOCTOR" && appointment.doctor.user.id === userId;

  if (!isPatient && !isDoctor) {
    throw new AppError("You do not have access to this record", 403);
  }

  return {
    id: appointment.id,
    scheduledAt: appointment.scheduledAt,
    status: appointment.status,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
    patient: {
      id: appointment.patient.id,
      firstName: appointment.patient.firstName,
      lastName: appointment.patient.lastName,
      profilePicture: appointment.patient.profilePicture,
    },
    doctor: {
      id: appointment.doctor.id,
      firstName: appointment.doctor.firstName,
      lastName: appointment.doctor.lastName,
      specialization: appointment.doctor.specialization,
      profilePicture: appointment.doctor.profilePicture,
    },
    consultationNote: appointment.consultationNote,
    prescriptions: appointment.prescriptions,
  };
}

export async function listPatientMedicalRecordsForDoctor(
  userId: string,
  appointmentId: string,
  query: ListMedicalRecordsQueryInput,
) {
  const { page, limit } = query;

  const appointment =
    await appointmentRepository.findAppointmentById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.doctor.userId !== userId) {
    throw new AppError("You do not have access to this appointment", 403);
  }

  const { appointments, total } =
    await medicalRecordRepository.findCompletedAppointmentsByPatientIdExcluding(
      appointment.patientId,
      appointmentId,
      query,
    );

  return {
    data: appointments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
