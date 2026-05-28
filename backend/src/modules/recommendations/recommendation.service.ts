import { AppError } from "../../errors/app-error.js";
import { generateContent } from "../../lib/gemini.js";
import * as doctorRepository from "../doctors/doctor.repository.js";
import * as patientRepository from "../patients/patient.repository.js";
import {
  toPublicDoctorDto,
} from "../doctors/doctor.utils.js";
import * as recommendationRepository from "./recommendation.repository.js";

interface RecommendationResult {
  specialization: string;
  explanation: string;
}

function buildPrompt(input: string, specializations: string[]): string {
  return `You are a medical triage assistant helping patients find the right doctor.

Available doctor specializations on this platform:
${specializations.map((s) => `- ${s}`).join("\n")}

Patient's health information:
"${input}"

Based on the patient's health information above, identify the single most appropriate specialization from the list provided.

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "specialization": "<exact specialization name from the list>",
  "explanation": "<1-2 sentence patient-friendly explanation of why this specialist is recommended>"
}`;
}

function parseGeminiResponse(raw: string): RecommendationResult {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AppError(
      "Unable to process AI recommendation. Please try again.",
      500,
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>)["specialization"] !== "string" ||
    typeof (parsed as Record<string, unknown>)["explanation"] !== "string"
  ) {
    throw new AppError(
      "Unable to process AI recommendation. Please try again.",
      500,
    );
  }

  const result = parsed as RecommendationResult;
  return result;
}

async function getMatchedDoctors(specialization: string) {
  const matchedDoctors =
    await doctorRepository.findDoctorsBySpecialization(specialization);
  const ratingStats = await doctorRepository.getDoctorRatingStats(
    matchedDoctors.map((d) => d.id),
  );

  return matchedDoctors.map((doctor) =>
    toPublicDoctorDto(doctor, ratingStats.get(doctor.id)),
  );
}

async function generateAndPersistRecommendation(
  patientId: string,
  source: "HISTORY" | "SYMPTOMS",
  input: string,
) {
  const specializations = await doctorRepository.getAllSpecializations();

  if (specializations.length === 0) {
    throw new AppError(
      "No doctors available for recommendations at this time",
      404,
    );
  }

  const prompt = buildPrompt(input, specializations);
  const raw = await generateContent(prompt);
  const recommendation = parseGeminiResponse(raw);

  const matchedDoctors = await getMatchedDoctors(recommendation.specialization);

  await recommendationRepository.createRecommendation({
    patientId,
    source,
    input,
    specialization: recommendation.specialization,
    explanation: recommendation.explanation,
    doctorIds: matchedDoctors.map((d) => d.id),
  });

  return {
    recommendation,
    doctors: matchedDoctors,
  };
}

export async function getDefaultRecommendation(userId: string) {
  const [patient, specializations] = await Promise.all([
    patientRepository.findPatientByUserId(userId),
    doctorRepository.getAllSpecializations(),
  ]);

  if (!patient) {
    throw new AppError("Patient profile not found", 404);
  }

  if (!patient.history || patient.history.trim().length === 0) {
    throw new AppError(
      "Medical history is required for recommendations. Please update your profile.",
      400,
    );
  }

  if (specializations.length === 0) {
    throw new AppError(
      "No doctors available for recommendations at this time",
      404,
    );
  }

  const cached = await recommendationRepository.findLatestByPatientAndSource(
    patient.id,
    "HISTORY",
  );

  if (cached && cached.input === patient.history) {
    const doctors = await getMatchedDoctors(cached.specialization);

    return {
      recommendation: {
        specialization: cached.specialization,
        explanation: cached.explanation,
      },
      doctors,
      cached: true,
    };
  }

  const result = await generateAndPersistRecommendation(
    patient.id,
    "HISTORY",
    patient.history,
  );

  return {
    ...result,
    cached: false,
  };
}

export async function getCustomRecommendation(userId: string, symptoms: string) {
  const patient = await patientRepository.findPatientByUserId(userId);

  if (!patient) {
    throw new AppError("Patient profile not found", 404);
  }

  const result = await generateAndPersistRecommendation(
    patient.id,
    "SYMPTOMS",
    symptoms,
  );

  return {
    ...result,
    cached: false,
  };
}
