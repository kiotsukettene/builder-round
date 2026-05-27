import prisma from "../../lib/prisma.js";
export async function findUserByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
        include: {
            patient: { select: { firstName: true } },
            doctor: { select: { firstName: true } },
        },
    });
}
export async function findUserById(id) {
    return prisma.user.findUnique({
        where: { id },
        omit: { password: true },
        include: {
            patient: true,
            doctor: true,
        },
    });
}
export async function findUserByVerificationToken(hashedToken) {
    return prisma.user.findUnique({
        where: { emailVerificationToken: hashedToken },
    });
}
export async function setVerificationToken(userId, hashedToken, expiresAt) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            emailVerificationToken: hashedToken,
            emailVerificationExpires: expiresAt,
            lastVerificationEmailSentAt: new Date(),
        },
    });
}
export async function markEmailVerified(userId) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        },
    });
}
export async function revokeRefreshToken(tokenHash, expiresAt) {
    await prisma.revokedRefreshToken.upsert({
        where: { tokenHash },
        create: { tokenHash, expiresAt },
        update: { expiresAt },
    });
}
export async function isRefreshTokenRevoked(tokenHash) {
    const revoked = await prisma.revokedRefreshToken.findUnique({
        where: { tokenHash },
    });
    return revoked !== null;
}
export async function createUser(data) {
    const { email, hashedPassword, role, firstName, lastName, emailVerificationToken, emailVerificationExpires, lastVerificationEmailSentAt, } = data;
    if (role === "PATIENT") {
        return prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                emailVerified: false,
                emailVerificationToken,
                emailVerificationExpires,
                lastVerificationEmailSentAt,
                patient: {
                    create: { firstName, lastName },
                },
            },
            omit: { password: true },
            include: { patient: true },
        });
    }
    return prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role,
            emailVerified: false,
            emailVerificationToken,
            emailVerificationExpires,
            lastVerificationEmailSentAt,
            doctor: {
                create: {
                    firstName,
                    lastName,
                    specialization: data.specialization,
                },
            },
        },
        omit: { password: true },
        include: { doctor: true },
    });
}
//# sourceMappingURL=auth.repository.js.map