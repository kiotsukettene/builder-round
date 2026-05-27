import { AppError } from "../../errors/app-error.js";
import {
  deleteImage,
  extractCloudinaryPublicId,
  uploadImage,
} from "../../lib/cloudinary.js";
import * as doctorRepository from "./doctor.repository.js";
import { isDoctorProfileComplete, toDoctorDto } from "./doctor.utils.js";
import type {
  CompleteProfileInput,
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
