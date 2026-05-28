import prisma from "../../lib/prisma.js";
import { getCached, setCache, invalidateCache } from "../../lib/cache.js";
import type {
  CompleteProfileInput,
  ListDoctorsQueryInput,
  UpdateProfileInput,
} from "./doctor.validation.js";

const SPECIALIZATIONS_CACHE_KEY = "doctor:specializations";
const SPECIALIZATIONS_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function findDoctorByUserId(userId: string) {
  return prisma.doctor.findUnique({
    where: { userId },
  });
}

export async function completeDoctorProfile(
  userId: string,
  data: CompleteProfileInput,
) {
  const updateData: {
    bio: string;
    fee: number;
    consultationDuration?: number;
    profileCompletedAt: Date;
  } = {
    bio: data.bio,
    fee: data.fee,
    profileCompletedAt: new Date(),
  };

  if (data.consultationDuration !== undefined) {
    updateData.consultationDuration = data.consultationDuration;
  }

  return prisma.doctor.update({
    where: { userId },
    data: updateData,
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
    consultationDuration?: number;
  } = {};

  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.specialization !== undefined) updateData.specialization = data.specialization;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.fee !== undefined) updateData.fee = data.fee;
  if (data.consultationDuration !== undefined) updateData.consultationDuration = data.consultationDuration;

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

export async function findDoctorForSlots(id: string) {
  return prisma.doctor.findFirst({
    where: { id, profileCompletedAt: { not: null } },
    select: {
      id: true,
      consultationDuration: true,
      fee: true,
      availabilities: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      blockedDates: true,
    },
  });
}

export async function findAppointmentsOnDate(doctorId: string, date: Date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return prisma.appointment.findMany({
    where: {
      doctorId,
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledAt: { gte: start, lte: end },
    },
    select: { scheduledAt: true },
  });
}

export async function getAllSpecializations(): Promise<string[]> {
  const cached = getCached<string[]>(SPECIALIZATIONS_CACHE_KEY);
  if (cached) return cached;

  const rows = await prisma.doctor.findMany({
    where: { profileCompletedAt: { not: null } },
    select: { specialization: true },
    distinct: ["specialization"],
    orderBy: { specialization: "asc" },
  });

  const specializations = rows.map((r) => r.specialization);
  setCache(SPECIALIZATIONS_CACHE_KEY, specializations, SPECIALIZATIONS_TTL_MS);
  return specializations;
}

export function invalidateSpecializationsCache(): void {
  invalidateCache(SPECIALIZATIONS_CACHE_KEY);
}

export async function findDoctorsBySpecialization(specialization: string) {
  return prisma.doctor.findMany({
    where: {
      profileCompletedAt: { not: null },
      specialization: { contains: specialization, mode: "insensitive" },
    },
    take: 10,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}
