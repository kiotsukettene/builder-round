import type { Doctor } from "../../generated/prisma/client.js";

export function isDoctorProfileComplete(
  doctor: Pick<Doctor, "profileCompletedAt">,
): boolean {
  return doctor.profileCompletedAt !== null;
}

export function toDoctorDto(doctor: Doctor) {
  return {
    ...doctor,
    isProfileComplete: isDoctorProfileComplete(doctor),
  };
}

export function formatUserWithDoctorDto<T extends { doctor?: Doctor | null }>(
  user: T,
) {
  if (!user.doctor) {
    return user;
  }

  return {
    ...user,
    doctor: toDoctorDto(user.doctor),
  };
}
