import type { RecommendationSource } from "../../generated/prisma/client.js";
import prisma from "../../lib/prisma.js";

interface CreateRecommendationData {
  patientId: string;
  source: RecommendationSource;
  input: string;
  specialization: string;
  explanation: string;
  doctorIds: string[];
}

export async function findLatestByPatientAndSource(
  patientId: string,
  source: RecommendationSource,
) {
  return prisma.recommendation.findFirst({
    where: { patientId, source },
    orderBy: { createdAt: "desc" },
  });
}

export async function createRecommendation(data: CreateRecommendationData) {
  return prisma.recommendation.create({
    data,
  });
}
