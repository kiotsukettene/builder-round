import { AppError } from "../../errors/app-error.js";
import {
  deleteImage,
  extractCloudinaryPublicId,
  uploadImage,
} from "../../lib/cloudinary.js";
import * as patientRepository from "./patient.repository.js";
import {
  isPatientProfileComplete,
  toPatientDto,
} from "./patient.utils.js";
import type {
  CompleteProfileInput,
  UpdateProfileInput,
} from "./patient.validation.js";

async function getPatientOrThrow(userId: string) {
  const patient = await patientRepository.findPatientByUserId(userId);
  if (!patient) {
    throw new AppError("Patient profile not found", 404);
  }

  return patient;
}

export async function completeProfile(
  userId: string,
  data: CompleteProfileInput,
) {
  const patient = await getPatientOrThrow(userId);

  if (isPatientProfileComplete(patient)) {
    throw new AppError("Patient profile is already complete", 409);
  }

  if (!patient.profilePicture) {
    throw new AppError(
      "Profile picture is required. Upload a picture before completing your profile.",
      400,
    );
  }

  const updatedPatient = await patientRepository.completePatientProfile(
    userId,
    data,
  );

  return toPatientDto(updatedPatient);
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const patient = await getPatientOrThrow(userId);

  if (!isPatientProfileComplete(patient)) {
    throw new AppError("Please complete your profile before making updates", 403);
  }

  const updatedPatient = await patientRepository.updatePatientByUserId(
    userId,
    data,
  );

  return toPatientDto(updatedPatient);
}

export async function uploadProfilePicture(
  userId: string,
  file: Express.Multer.File | undefined,
) {
  if (!file) {
    throw new AppError("Profile picture file is required", 400);
  }

  const patient = await getPatientOrThrow(userId);

  if (patient.profilePicture) {
    const publicId = extractCloudinaryPublicId(patient.profilePicture);
    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch {
        // Best-effort cleanup; continue with new upload
      }
    }
  }

  const { secureUrl } = await uploadImage(file.buffer, {
    folder: `tellmd/patients/${userId}`,
  });

  const updatedPatient = await patientRepository.updateProfilePicture(
    userId,
    secureUrl,
  );

  return { profilePicture: updatedPatient.profilePicture };
}
