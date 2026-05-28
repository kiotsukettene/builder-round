import { Resend } from "resend";
import { env } from "../../../config/env.js";
import type { EmailProvider, SendEmailOptions } from "../email.types.js";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export const resendProvider: EmailProvider = {
  async send(options: SendEmailOptions): Promise<void> {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
};
