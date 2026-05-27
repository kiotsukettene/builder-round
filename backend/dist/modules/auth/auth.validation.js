import { z } from "zod";
const patientRegisterSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.literal("PATIENT"),
});
const doctorRegisterSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.literal("DOCTOR"),
    specialization: z.string().min(1, "Specialization is required for doctors"),
});
export const registerSchema = z.discriminatedUnion("role", [
    patientRegisterSchema,
    doctorRegisterSchema,
]);
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});
export const refreshSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});
export const logoutSchema = refreshSchema;
export const verifyEmailSchema = z.object({
    token: z.string().min(1, "Verification token is required"),
});
export const resendVerificationSchema = z.object({
    email: z.string().email("Invalid email address"),
});
//# sourceMappingURL=auth.validation.js.map