import prisma from "../../lib/prisma.js";
import type { RegisterInput } from "./auth.validation.js";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
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

export async function createUser(data: RegisterInput & { hashedPassword: string }) {
  const { email, hashedPassword, role, firstName, lastName } = data;

  if (role === "PATIENT") {
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
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
