import { AppError } from "../../errors/app-error.js";
import { generateContent } from "../../lib/gemini.js";
import * as doctorRepository from "../doctors/doctor.repository.js";
import * as patientRepository from "../patients/patient.repository.js";
import { toPublicDoctorDto } from "../doctors/doctor.utils.js";

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

async function buildRecommendation(input: string) {
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

  const matchedDoctors = await doctorRepository.findDoctorsBySpecialization(
    recommendation.specialization,
  );

  return {
    recommendation,
    doctors: matchedDoctors.map(toPublicDoctorDto),
  };
}

export async function getDefaultRecommendation(userId: string) {
  // Fetch the patient profile and available specializations in parallel
  // so the specialization list is ready by the time we validate patient history.
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

  const prompt = buildPrompt(patient.history, specializations);
  const raw = await generateContent(prompt);
  const recommendation = parseGeminiResponse(raw);

  const matchedDoctors = await doctorRepository.findDoctorsBySpecialization(
    recommendation.specialization,
  );

  return {
    recommendation,
    doctors: matchedDoctors.map(toPublicDoctorDto),
  };
}

export async function getCustomRecommendation(symptoms: string) {
  return buildRecommendation(symptoms);
}
