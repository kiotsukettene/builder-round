import type { Doctor, DoctorAvailability } from "../../generated/prisma/client.js";

type PublicDoctorFields = Pick<
  Doctor,
  | "id"
  | "firstName"
  | "lastName"
  | "specialization"
  | "bio"
  | "fee"
  | "consultationDuration"
  | "profilePicture"
>;

type DoctorWithAvailabilities = PublicDoctorFields & {
  availabilities: DoctorAvailability[];
};

export interface DoctorRatingStats {
  averageRating: number | null;
  totalReviews: number;
}

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

export function toPublicDoctorDto(
  doctor: PublicDoctorFields,
  ratingStats?: DoctorRatingStats,
) {
  return {
    id: doctor.id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    specialization: doctor.specialization,
    bio: doctor.bio,
    fee: doctor.fee,
    consultationDuration: doctor.consultationDuration,
    profilePicture: doctor.profilePicture,
    averageRating: ratingStats?.averageRating ?? null,
    totalReviews: ratingStats?.totalReviews ?? 0,
  };
}

export function toPublicDoctorWithAvailabilityDto(
  doctor: DoctorWithAvailabilities,
  ratingStats?: DoctorRatingStats,
) {
  return {
    ...toPublicDoctorDto(doctor, ratingStats),
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
