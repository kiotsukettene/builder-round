import type { RegisterInput, LoginInput, ResendVerificationInput } from "./auth.validation.js";
export declare function register(data: RegisterInput): Promise<{
    user: ({
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
    });
}>;
export declare function verifyEmail(token: string): Promise<void>;
export declare function resendVerification(data: ResendVerificationInput): Promise<void>;
export declare function login(data: LoginInput): Promise<{
    user: {
        patient: {
            firstName: string;
        } | null;
        doctor: {
            firstName: string;
        } | null;
        id: string;
        email: string;
        role: import("../../generated/prisma/enums.js").Role;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        emailVerificationExpires: Date | null;
        lastVerificationEmailSentAt: Date | null;
        createdAt: Date;
    };
    accessToken: string;
    refreshToken: string;
}>;
export declare function refresh(token: string): Promise<{
    accessToken: string;
}>;
export declare function logout(userId: string, refreshToken: string): Promise<void>;
export declare function getProfile(userId: string): Promise<{
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
}>;
//# sourceMappingURL=auth.service.d.ts.map