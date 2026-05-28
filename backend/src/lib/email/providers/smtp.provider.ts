import nodemailer from "nodemailer";
import { env } from "../../../config/env.js";
import type { EmailProvider, SendEmailOptions } from "../email.types.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
      throw new Error("SMTP credentials are not configured");
    }

    const isGmail = env.SMTP_HOST === "smtp.gmail.com";

    transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: "gmail",
            auth: {
              user: env.SMTP_USER,
              pass: env.SMTP_PASSWORD,
            },
          }
        : {
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465,
            requireTLS: env.SMTP_PORT === 587,
            auth: {
              user: env.SMTP_USER,
              pass: env.SMTP_PASSWORD,
            },
          },
    );
  }

  return transporter;
}

export const smtpProvider: EmailProvider = {
  async send(options: SendEmailOptions): Promise<void> {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  },
};
