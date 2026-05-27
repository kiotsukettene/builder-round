import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly RevokedRefreshToken: "RevokedRefreshToken";
    readonly Patient: "Patient";
    readonly Doctor: "Doctor";
    readonly DoctorAvailability: "DoctorAvailability";
    readonly Appointment: "Appointment";
    readonly ConsultationNote: "ConsultationNote";
    readonly Prescription: "Prescription";
    readonly Notification: "Notification";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly password: "password";
    readonly role: "role";
    readonly emailVerified: "emailVerified";
    readonly emailVerificationToken: "emailVerificationToken";
    readonly emailVerificationExpires: "emailVerificationExpires";
    readonly lastVerificationEmailSentAt: "lastVerificationEmailSentAt";
    readonly createdAt: "createdAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const RevokedRefreshTokenScalarFieldEnum: {
    readonly id: "id";
    readonly tokenHash: "tokenHash";
    readonly expiresAt: "expiresAt";
    readonly createdAt: "createdAt";
};
export type RevokedRefreshTokenScalarFieldEnum = (typeof RevokedRefreshTokenScalarFieldEnum)[keyof typeof RevokedRefreshTokenScalarFieldEnum];
export declare const PatientScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly firstName: "firstName";
    readonly lastName: "lastName";
    readonly birthday: "birthday";
    readonly weight: "weight";
    readonly height: "height";
    readonly phone: "phone";
    readonly history: "history";
    readonly profilePicture: "profilePicture";
};
export type PatientScalarFieldEnum = (typeof PatientScalarFieldEnum)[keyof typeof PatientScalarFieldEnum];
export declare const DoctorScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly firstName: "firstName";
    readonly lastName: "lastName";
    readonly specialization: "specialization";
    readonly bio: "bio";
    readonly fee: "fee";
    readonly profilePicture: "profilePicture";
};
export type DoctorScalarFieldEnum = (typeof DoctorScalarFieldEnum)[keyof typeof DoctorScalarFieldEnum];
export declare const DoctorAvailabilityScalarFieldEnum: {
    readonly id: "id";
    readonly doctorId: "doctorId";
    readonly dayOfWeek: "dayOfWeek";
    readonly startTime: "startTime";
    readonly endTime: "endTime";
};
export type DoctorAvailabilityScalarFieldEnum = (typeof DoctorAvailabilityScalarFieldEnum)[keyof typeof DoctorAvailabilityScalarFieldEnum];
export declare const AppointmentScalarFieldEnum: {
    readonly id: "id";
    readonly patientId: "patientId";
    readonly doctorId: "doctorId";
    readonly scheduledAt: "scheduledAt";
    readonly status: "status";
    readonly meetingUrl: "meetingUrl";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AppointmentScalarFieldEnum = (typeof AppointmentScalarFieldEnum)[keyof typeof AppointmentScalarFieldEnum];
export declare const ConsultationNoteScalarFieldEnum: {
    readonly id: "id";
    readonly appointmentId: "appointmentId";
    readonly diagnosis: "diagnosis";
    readonly notes: "notes";
    readonly recommendations: "recommendations";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ConsultationNoteScalarFieldEnum = (typeof ConsultationNoteScalarFieldEnum)[keyof typeof ConsultationNoteScalarFieldEnum];
export declare const PrescriptionScalarFieldEnum: {
    readonly id: "id";
    readonly appointmentId: "appointmentId";
    readonly medication: "medication";
    readonly dosage: "dosage";
    readonly frequency: "frequency";
    readonly duration: "duration";
    readonly instructions: "instructions";
    readonly createdAt: "createdAt";
};
export type PrescriptionScalarFieldEnum = (typeof PrescriptionScalarFieldEnum)[keyof typeof PrescriptionScalarFieldEnum];
export declare const NotificationScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly type: "type";
    readonly title: "title";
    readonly message: "message";
    readonly isRead: "isRead";
    readonly relatedId: "relatedId";
    readonly createdAt: "createdAt";
};
export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map