import type {
  Appointment,
  Doctor,
  Patient,
  User,
} from "../../generated/prisma/client.js";

type AppointmentWithRelations = Appointment & {
  patient: Patient & { user: Pick<User, "id"> };
  doctor: Doctor & { user: Pick<User, "id"> };
};

export function toAppointmentDto(appointment: AppointmentWithRelations) {
  return {
    id: appointment.id,
    scheduledAt: appointment.scheduledAt,
    status: appointment.status,
    meetingUrl: appointment.meetingUrl,
    notes: appointment.notes,
    cancellationReason: appointment.cancellationReason,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
    patient: {
      id: appointment.patient.id,
      userId: appointment.patient.userId,
      firstName: appointment.patient.firstName,
      lastName: appointment.patient.lastName,
      profilePicture: appointment.patient.profilePicture,
      birthday: appointment.patient.birthday,
      weight: appointment.patient.weight,
      height: appointment.patient.height,
      phone: appointment.patient.phone,
      history: appointment.patient.history,
    },
    doctor: {
      id: appointment.doctor.id,
      userId: appointment.doctor.userId,
      firstName: appointment.doctor.firstName,
      lastName: appointment.doctor.lastName,
      specialization: appointment.doctor.specialization,
      fee: appointment.doctor.fee,
      profilePicture: appointment.doctor.profilePicture,
    },
  };
}
