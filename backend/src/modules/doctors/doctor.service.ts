import { AppError } from "../../errors/app-error.js";
import {
  deleteImage,
  extractCloudinaryPublicId,
  uploadImage,
} from "../../lib/cloudinary.js";
import * as doctorRepository from "./doctor.repository.js";
import {
  isDoctorProfileComplete,
  toDoctorDto,
  toPublicDoctorDto,
  toPublicDoctorWithAvailabilityDto,
} from "./doctor.utils.js";
import type {
  CompleteProfileInput,
  ListDoctorsQueryInput,
  UpdateProfileInput,
} from "./doctor.validation.js";

async function getDoctorOrThrow(userId: string) {
  const doctor = await doctorRepository.findDoctorByUserId(userId);
  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  return doctor;
}

export async function getProfile(userId: string) {
  const doctor = await getDoctorOrThrow(userId);
  return toDoctorDto(doctor);
}

export async function completeProfile(
  userId: string,
  data: CompleteProfileInput,
) {
  const doctor = await getDoctorOrThrow(userId);

  if (isDoctorProfileComplete(doctor)) {
    throw new AppError("Doctor profile is already complete", 409);
  }

  if (!doctor.profilePicture) {
    throw new AppError(
      "Profile picture is required. Upload a picture before completing your profile.",
      400,
    );
  }

  const updatedDoctor = await doctorRepository.completeDoctorProfile(
    userId,
    data,
  );

  return toDoctorDto(updatedDoctor);
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const doctor = await getDoctorOrThrow(userId);

  if (!isDoctorProfileComplete(doctor)) {
    throw new AppError("Please complete your profile before making updates", 403);
  }

  const updatedDoctor = await doctorRepository.updateDoctorByUserId(
    userId,
    data,
  );

  return toDoctorDto(updatedDoctor);
}

export async function uploadProfilePicture(
  userId: string,
  file: Express.Multer.File | undefined,
) {
  if (!file) {
    throw new AppError("Profile picture file is required", 400);
  }

  const doctor = await getDoctorOrThrow(userId);

  if (doctor.profilePicture) {
    const publicId = extractCloudinaryPublicId(doctor.profilePicture);
    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch {
        // Best-effort cleanup; continue with new upload
      }
    }
  }

  const { secureUrl } = await uploadImage(file.buffer, {
    folder: `tellmd/doctors/${userId}`,
  });

  const updatedDoctor = await doctorRepository.updateProfilePicture(
    userId,
    secureUrl,
  );

  return { profilePicture: updatedDoctor.profilePicture };
}

export async function listDoctors(query: ListDoctorsQueryInput) {
  const { page, limit } = query;
  const { doctors, total } = await doctorRepository.findDoctors(query);

  return {
    data: doctors.map(toPublicDoctorDto),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getDoctorById(id: string) {
  const doctor = await doctorRepository.findDoctorById(id);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  return toPublicDoctorWithAvailabilityDto(doctor);
}

export async function getAvailableSlots(doctorId: string, dateStr: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new AppError("date query param must be in YYYY-MM-DD format", 400);
  }

  const doctor = await doctorRepository.findDoctorForSlots(doctorId);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const date = new Date(dateStr);
  const dayOfWeek = date.getUTCDay();

  const isBlocked = doctor.blockedDates.some((b) => {
    const blocked = new Date(b.date);
    return (
      blocked.getUTCFullYear() === date.getUTCFullYear() &&
      blocked.getUTCMonth() === date.getUTCMonth() &&
      blocked.getUTCDate() === date.getUTCDate()
    );
  });

  if (isBlocked) {
    return {
      date: dateStr,
      consultationDuration: doctor.consultationDuration,
      consultationFee: doctor.fee,
      slots: [],
    };
  }

  const windows = doctor.availabilities.filter(
    (a) => a.dayOfWeek === dayOfWeek,
  );

  if (windows.length === 0) {
    return {
      date: dateStr,
      consultationDuration: doctor.consultationDuration,
      consultationFee: doctor.fee,
      slots: [],
    };
  }

  const bookedAppointments = await doctorRepository.findAppointmentsOnDate(
    doctor.id,
    date,
  );

  const bookedTimes = new Set(
    bookedAppointments.map((a) => {
      const h = a.scheduledAt.getUTCHours().toString().padStart(2, "0");
      const m = a.scheduledAt.getUTCMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    }),
  );

  const duration = doctor.consultationDuration;
  const slots: { startTime: string; endTime: string; available: boolean }[] =
    [];

  for (const window of windows) {
    const startParts = window.startTime.split(":");
    const endParts = window.endTime.split(":");
    const startH = Number(startParts[0] ?? 0);
    const startM = Number(startParts[1] ?? 0);
    const endH = Number(endParts[0] ?? 0);
    const endM = Number(endParts[1] ?? 0);

    let current = startH * 60 + startM;
    const windowEnd = endH * 60 + endM;

    while (current + duration <= windowEnd) {
      const slotStartH = Math.floor(current / 60)
        .toString()
        .padStart(2, "0");
      const slotStartM = (current % 60).toString().padStart(2, "0");
      const slotStart = `${slotStartH}:${slotStartM}`;

      const slotEndMinutes = current + duration;
      const slotEndH = Math.floor(slotEndMinutes / 60)
        .toString()
        .padStart(2, "0");
      const slotEndM = (slotEndMinutes % 60).toString().padStart(2, "0");
      const slotEnd = `${slotEndH}:${slotEndM}`;

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: !bookedTimes.has(slotStart),
      });

      current += duration;
    }
  }

  return {
    date: dateStr,
    consultationDuration: duration,
    consultationFee: doctor.fee,
    slots,
  };
}
