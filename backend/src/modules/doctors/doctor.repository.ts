import prisma from "../../lib/prisma.js";
import type {
  CompleteProfileInput,
  UpdateProfileInput,
} from "./doctor.validation.js";

export async function findDoctorByUserId(userId: string) {
  return prisma.doctor.findUnique({
    where: { userId },
  });
}

export async function completeDoctorProfile(
  userId: string,
  data: CompleteProfileInput,
) {
  return prisma.doctor.update({
    where: { userId },
    data: {
      ...data,
      profileCompletedAt: new Date(),
    },
  });
}

export async function updateDoctorByUserId(
  userId: string,
  data: UpdateProfileInput,
) {
  const updateData: {
    firstName?: string;
    lastName?: string;
    specialization?: string;
    bio?: string;
    fee?: number;
  } = {};

  if (data.firstName !== undefined) {
    updateData.firstName = data.firstName;
  }
  if (data.lastName !== undefined) {
    updateData.lastName = data.lastName;
  }
  if (data.specialization !== undefined) {
    updateData.specialization = data.specialization;
  }
  if (data.bio !== undefined) {
    updateData.bio = data.bio;
  }
  if (data.fee !== undefined) {
    updateData.fee = data.fee;
  }

  return prisma.doctor.update({
    where: { userId },
    data: updateData,
  });
}

export async function updateProfilePicture(
  userId: string,
  profilePictureUrl: string,
) {
  return prisma.doctor.update({
    where: { userId },
    data: { profilePicture: profilePictureUrl },
  });
}
