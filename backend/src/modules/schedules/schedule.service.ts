import { AppError } from "../../errors/app-error.js";
import * as scheduleRepository from "./schedule.repository.js";
import * as doctorRepository from "../doctors/doctor.repository.js";
import type { SetAvailabilityInput, BlockDateInput } from "./schedule.validation.js";

async function getDoctorOrThrow(userId: string) {
  const doctor = await doctorRepository.findDoctorByUserId(userId);
  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  return doctor;
}

export async function getAvailability(userId: string) {
  const doctor = await getDoctorOrThrow(userId);
  const availability = await scheduleRepository.findDoctorAvailability(doctor.id);

  return {
    consultationDuration: doctor.consultationDuration,
    slots: availability.map(({ id, dayOfWeek, startTime, endTime }) => ({
      id,
      dayOfWeek,
      startTime,
      endTime,
    })),
  };
}

export async function setAvailability(
  userId: string,
  input: SetAvailabilityInput,
) {
  const doctor = await getDoctorOrThrow(userId);

  const slots = await scheduleRepository.replaceAvailability(
    doctor.id,
    input.slots,
    input.consultationDuration,
  );

  const updatedDuration = input.consultationDuration ?? doctor.consultationDuration;

  return {
    consultationDuration: updatedDuration,
    slots: slots.map(({ id, dayOfWeek, startTime, endTime }) => ({
      id,
      dayOfWeek,
      startTime,
      endTime,
    })),
  };
}

export async function blockDate(userId: string, input: BlockDateInput) {
  const doctor = await getDoctorOrThrow(userId);

  const date = new Date(input.date);

  const existing = await scheduleRepository.findBlockedDateByDoctorAndDate(
    doctor.id,
    date,
  );
  if (existing) {
    throw new AppError("This date is already blocked", 409);
  }

  const blocked = await scheduleRepository.createBlockedDate(
    doctor.id,
    date,
    input.reason,
  );

  return {
    id: blocked.id,
    date: blocked.date.toISOString().split("T")[0],
    reason: blocked.reason,
    createdAt: blocked.createdAt,
  };
}

export async function getBlockedDates(userId: string) {
  const doctor = await getDoctorOrThrow(userId);
  const blockedDates = await scheduleRepository.findBlockedDates(doctor.id);

  return blockedDates.map((b) => ({
    id: b.id,
    date: b.date.toISOString().split("T")[0],
    reason: b.reason,
    createdAt: b.createdAt,
  }));
}

export async function removeBlockedDate(userId: string, blockedDateId: string) {
  const doctor = await getDoctorOrThrow(userId);

  const blockedDate = await scheduleRepository.findBlockedDateById(blockedDateId);
  if (!blockedDate) {
    throw new AppError("Blocked date not found", 404);
  }

  if (blockedDate.doctorId !== doctor.id) {
    throw new AppError("You do not have permission to remove this blocked date", 403);
  }

  await scheduleRepository.deleteBlockedDate(blockedDateId);
}
