import type { RegisterInput } from "./auth.validation.js";
export declare function findUserByEmail(email: string): Promise<({
    patient: {
        firstName: string;
    } | null;
    doctor: {
        firstName: string;
    } | null;
} & {
    id: string;
    email: string;
    password: string;
    role: import("../../generated/prisma/enums.js").Role;
    emailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpires: Date | null;
    lastVerificationEmailSentAt: Date | null;
    createdAt: Date;
}) | null>;
export declare function findUserById(id: string): Promise<({
    patient: {
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        birthday: Date | null;
        weight: number | null;
        height: number | null;
        phone: string | null;
        history: string | null;
        profilePicture: string | null;
    } | null;
    doctor: {
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        specialization: string;
        bio: string | null;
        fee: number | null;
    } | null;
} & {
    id: string;
    email: string;
    role: import("../../generated/prisma/enums.js").Role;
    emailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpires: Date | null;
    lastVerificationEmailSentAt: Date | null;
    createdAt: Date;
}) | null>;
export declare function findUserByVerificationToken(hashedToken: string): Promise<{
    id: string;
    email: string;
    password: string;
    role: import("../../generated/prisma/enums.js").Role;
    emailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpires: Date | null;
    lastVerificationEmailSentAt: Date | null;
    createdAt: Date;
} | null>;
export declare function setVerificationToken(userId: string, hashedToken: string, expiresAt: Date): Promise<void>;
export declare function markEmailVerified(userId: string): Promise<void>;
export declare function revokeRefreshToken(tokenHash: string, expiresAt: Date): Promise<void>;
export declare function isRefreshTokenRevoked(tokenHash: string): Promise<boolean>;
export declare function createUser(data: RegisterInput & {
    hashedPassword: string;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
    lastVerificationEmailSentAt: Date;
}): Promise<({
    patient: {
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        birthday: Date | null;
        weight: number | null;
        height: number | null;
        phone: string | null;
        history: string | null;
        profilePicture: string | null;
    } | null;
} & {
    id: string;
    email: string;
    role: import("../../generated/prisma/enums.js").Role;
    emailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpires: Date | null;
    lastVerificationEmailSentAt: Date | null;
    createdAt: Date;
}) | ({
    doctor: {
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        specialization: string;
        bio: string | null;
        fee: number | null;
    } | null;
} & {
    id: string;
    email: string;
    role: import("../../generated/prisma/enums.js").Role;
    emailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpires: Date | null;
    lastVerificationEmailSentAt: Date | null;
    createdAt: Date;
})>;
//# sourceMappingURL=auth.repository.d.ts.map