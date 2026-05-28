import prisma from "../../lib/prisma.js";
import type { SubmitReviewInput } from "./rating.validation.js";

export async function findReviewByAppointmentId(appointmentId: string) {
  return prisma.doctorReview.findUnique({
    where: { appointmentId },
  });
}

export async function createReview(data: {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  rating: number;
  comment?: string;
}) {
  return prisma.doctorReview.create({
    data,
  });
}

export async function findReviewsByDoctorId(doctorId: string) {
  return prisma.doctorReview.findMany({
    where: { doctorId },
    orderBy: { createdAt: "desc" },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function findAppointmentForReview(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: {
        include: {
          user: { select: { id: true } },
        },
      },
      review: true,
    },
  });
}

export async function getDoctorRatingAggregate(doctorId: string) {
  const aggregate = await prisma.doctorReview.aggregate({
    where: { doctorId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    averageRating:
      aggregate._avg.rating !== null
        ? Math.round(aggregate._avg.rating * 10) / 10
        : null,
    totalReviews: aggregate._count.rating,
  };
}

export type ReviewWithPatient = Awaited<
  ReturnType<typeof findReviewsByDoctorId>
>[number];
