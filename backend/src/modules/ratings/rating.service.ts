import { AppError } from "../../errors/app-error.js";
import * as doctorRepository from "../doctors/doctor.repository.js";
import * as ratingRepository from "./rating.repository.js";
import type { SubmitReviewInput } from "./rating.validation.js";

function toReviewDto(
  review: ratingRepository.ReviewWithPatient,
) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    patientName: `${review.patient.firstName} ${review.patient.lastName}`,
  };
}

export async function submitReview(
  userId: string,
  appointmentId: string,
  data: SubmitReviewInput,
) {
  const appointment =
    await ratingRepository.findAppointmentForReview(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.patient.user.id !== userId) {
    throw new AppError("Only the patient can review this consultation", 403);
  }

  if (appointment.status !== "COMPLETED") {
    throw new AppError(
      "You can only review a consultation after it has been completed",
      400,
    );
  }

  if (appointment.review) {
    throw new AppError("You have already reviewed this consultation", 409);
  }

  const review = await ratingRepository.createReview({
    appointmentId,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    rating: data.rating,
    ...(data.comment ? { comment: data.comment } : {}),
  });

  return review;
}

export async function listDoctorReviews(doctorId: string) {
  const doctor = await doctorRepository.findDoctorById(doctorId);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const reviews = await ratingRepository.findReviewsByDoctorId(doctorId);
  const aggregate = await ratingRepository.getDoctorRatingAggregate(doctorId);

  return {
    ...aggregate,
    reviews: reviews.map(toReviewDto),
  };
}
