import prisma from "../../lib/prisma.js";
import type { CompleteProfileInput, UpdateProfileInput } from "./patient.validation.js";

export async function findPatientByUserId(userId: string) {
  return prisma.patient.findUnique({
    where: { userId },
  });
}

export async function completePatientProfile(
  userId: string,
  data: CompleteProfileInput,
) {
  return prisma.patient.update({
    where: { userId },
    data: {
      ...data,
      birthday: new Date(`${data.birthday}T00:00:00.000Z`),
      profileCompletedAt: new Date(),
    },
  });
}

export async function updatePatientByUserId(
  userId: string,
  data: UpdateProfileInput,
) {
  const updateData: {
    firstName?: string;
    lastName?: string;
    birthday?: Date;
    weight?: number;
    height?: number;
    phone?: string;
    history?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  } = {};

  if (data.firstName !== undefined) {
    updateData.firstName = data.firstName;
  }
  if (data.lastName !== undefined) {
    updateData.lastName = data.lastName;
  }
  if (data.birthday !== undefined) {
    updateData.birthday = new Date(`${data.birthday}T00:00:00.000Z`);
  }
  if (data.weight !== undefined) {
    updateData.weight = data.weight;
  }
  if (data.height !== undefined) {
    updateData.height = data.height;
  }
  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }
  if (data.history !== undefined) {
    updateData.history = data.history;
  }
  if (data.address !== undefined) {
    updateData.address = data.address;
  }
  if (data.latitude !== undefined) {
    updateData.latitude = data.latitude;
  }
  if (data.longitude !== undefined) {
    updateData.longitude = data.longitude;
  }

  return prisma.patient.update({
    where: { userId },
    data: updateData,
  });
}

export async function updateProfilePicture(
  userId: string,
  profilePictureUrl: string,
) {
  return prisma.patient.update({
    where: { userId },
    data: { profilePicture: profilePictureUrl },
  });
}
