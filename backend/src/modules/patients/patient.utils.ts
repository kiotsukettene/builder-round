import type { Patient } from "../../generated/prisma/client.js";

export function isPatientProfileComplete(
  patient: Pick<Patient, "profileCompletedAt">,
): boolean {
  return patient.profileCompletedAt !== null;
}

export function toPatientDto(patient: Patient) {
  return {
    ...patient,
    isProfileComplete: isPatientProfileComplete(patient),
  };
}

export function formatUserWithPatientDto<T extends { patient?: Patient | null }>(
  user: T,
) {
  if (!user.patient) {
    return user;
  }

  return {
    ...user,
    patient: toPatientDto(user.patient),
  };
}
