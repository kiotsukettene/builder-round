import prisma from "../../lib/prisma.js";
import type { RegisterInput } from "./auth.validation.js";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      patient: { select: { firstName: true } },
      doctor: { select: { firstName: true } },
    },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    omit: { password: true },
    include: {
      patient: true,
      doctor: true,
    },
  });
}

export async function findUserByVerificationToken(hashedToken: string) {
  return prisma.user.findUnique({
    where: { emailVerificationToken: hashedToken },
  });
}

export async function setVerificationToken(
  userId: string,
  hashedToken: string,
  expiresAt: Date,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expiresAt,
      lastVerificationEmailSentAt: new Date(),
    },
  });
}

export async function markEmailVerified(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });
}

export async function revokeRefreshToken(
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await prisma.revokedRefreshToken.upsert({
    where: { tokenHash },
    create: { tokenHash, expiresAt },
    update: { expiresAt },
  });
}

export async function isRefreshTokenRevoked(tokenHash: string): Promise<boolean> {
  const revoked = await prisma.revokedRefreshToken.findUnique({
    where: { tokenHash },
  });
  return revoked !== null;
}

export async function createUser(
  data: RegisterInput & {
    hashedPassword: string;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
    lastVerificationEmailSentAt: Date;
  },
) {
  const {
    email,
    hashedPassword,
    role,
    firstName,
    lastName,
    emailVerificationToken,
    emailVerificationExpires,
    lastVerificationEmailSentAt,
  } = data;

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
