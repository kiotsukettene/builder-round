import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class.js";
import * as Prisma from "./internal/prismaNamespace.js";
export * as $Enums from './enums.js';
export * from "./enums.js";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model RevokedRefreshToken
 *
 */
export type RevokedRefreshToken = Prisma.RevokedRefreshTokenModel;
/**
 * Model Patient
 *
 */
export type Patient = Prisma.PatientModel;
/**
 * Model Doctor
 *
 */
export type Doctor = Prisma.DoctorModel;
/**
 * Model DoctorAvailability
 *
 */
export type DoctorAvailability = Prisma.DoctorAvailabilityModel;
/**
 * Model Appointment
 *
 */
export type Appointment = Prisma.AppointmentModel;
/**
 * Model ConsultationNote
 *
 */
export type ConsultationNote = Prisma.ConsultationNoteModel;
/**
 * Model Prescription
 *
 */
export type Prescription = Prisma.PrescriptionModel;
/**
 * Model Notification
 *
 */
export type Notification = Prisma.NotificationModel;
//# sourceMappingURL=client.d.ts.map