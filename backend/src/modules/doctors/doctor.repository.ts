import prisma from "../../lib/prisma.js";
import type {
  CompleteProfileInput,
  ListDoctorsQueryInput,
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

export async function findDoctors(filters: ListDoctorsQueryInput) {
  const { page, limit, search, specialization } = filters;
  const skip = (page - 1) * limit;

  const where = {
    profileCompletedAt: { not: null },
    ...(specialization && {
      specialization: { contains: specialization, mode: "insensitive" as const },
    }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [doctors, total] = await prisma.$transaction([
    prisma.doctor.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.doctor.count({ where }),
  ]);

  return { doctors, total };
}

export async function findDoctorById(id: string) {
  return prisma.doctor.findFirst({
    where: {
      id,
      profileCompletedAt: { not: null },
    },
    include: {
      availabilities: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });
}
