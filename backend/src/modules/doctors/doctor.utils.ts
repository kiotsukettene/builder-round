import type { Doctor, DoctorAvailability } from "../../generated/prisma/client.js";

type PublicDoctorFields = Pick<
  Doctor,
  | "id"
  | "firstName"
  | "lastName"
  | "specialization"
  | "bio"
  | "fee"
  | "profilePicture"
>;

type DoctorWithAvailabilities = PublicDoctorFields & {
  availabilities: DoctorAvailability[];
};

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

export function toPublicDoctorDto(doctor: PublicDoctorFields) {
  return {
    id: doctor.id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    specialization: doctor.specialization,
    bio: doctor.bio,
    fee: doctor.fee,
    profilePicture: doctor.profilePicture,
  };
}

export function toPublicDoctorWithAvailabilityDto(
  doctor: DoctorWithAvailabilities,
) {
  return {
    ...toPublicDoctorDto(doctor),
    availabilities: doctor.availabilities.map(
      ({ id, dayOfWeek, startTime, endTime }) => ({
        id,
        dayOfWeek,
        startTime,
        endTime,
      }),
    ),
  };
}
