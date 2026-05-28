import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";
import { buildVerificationEmail } from "./email.templates.js";
import type { EmailProvider, VerificationEmailParams } from "./email.types.js";
import { resendProvider } from "./providers/resend.provider.js";
import { smtpProvider } from "./providers/smtp.provider.js";

function getEmailProvider(): EmailProvider {
  return env.NODE_ENV === "production" ? resendProvider : smtpProvider;
}

export async function sendVerificationEmail(
  params: VerificationEmailParams,
): Promise<void> {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${params.token}`;
  const { subject, html, text } = buildVerificationEmail(
    params.firstName,
    verificationUrl,
  );

  try {
    await getEmailProvider().send({
      to: params.to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);

    const smtpError = error as { code?: string };
    if (smtpError.code === "EAUTH") {
      throw new AppError(
        "Email service authentication failed. Check SMTP_USER and SMTP_PASSWORD in .env (use a Gmail App Password, not your regular password).",
        500,
      );
    }

    throw new AppError("Failed to send verification email", 500);
  }
}
