import {
  buildEmailButton,
  EMAIL_COLORS,
  escapeHtml,
  wrapEmailBody,
} from "./email.layout.js";

export function buildVerificationEmail(
  firstName: string,
  verificationUrl: string,
): { subject: string; html: string; text: string } {
  const subject = "Verify your TellMD account";
  const safeFirstName = escapeHtml(firstName);
  const safeUrl = escapeHtml(verificationUrl);

  const text = [
    `Hi ${firstName},`,
    "",
    "Thanks for signing up for TellMD. Please verify your email address to activate your account.",
    "",
    verificationUrl,
    "",
    "This link expires in 24 hours.",
    "",
    "If you did not create an account, you can safely ignore this email.",
  ].join("\n");

  const contentHtml = `
<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: ${EMAIL_COLORS.foreground}; line-height: 1.3;">
  Verify your email
</h1>
<p style="margin: 0 0 12px; font-size: 15px; color: ${EMAIL_COLORS.foreground}; line-height: 1.6;">
  Hi ${safeFirstName},
</p>
<p style="margin: 0 0 12px; font-size: 15px; color: ${EMAIL_COLORS.foreground}; line-height: 1.6;">
  Thanks for signing up for TellMD. Please verify your email address to activate your account.
</p>
${buildEmailButton({ href: verificationUrl, label: "Verify email" })}
<p style="margin: 0 0 8px; font-size: 14px; color: ${EMAIL_COLORS.muted}; line-height: 1.5;">
  Or copy and paste this link into your browser:
</p>
<p style="margin: 0 0 24px; font-size: 13px; line-height: 1.5; word-break: break-all;">
  <a href="${safeUrl}" style="color: ${EMAIL_COLORS.foreground}; text-decoration: underline;">${safeUrl}</a>
</p>
<p style="margin: 0 0 8px; font-size: 13px; color: ${EMAIL_COLORS.muted}; line-height: 1.5;">
  This link expires in 24 hours.
</p>
<p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted}; line-height: 1.5;">
  If you did not create an account, you can safely ignore this email.
</p>`.trim();

  const html = wrapEmailBody({
    preheader: "Confirm your email to activate your TellMD account",
    title: subject,
    contentHtml,
  });

  return { subject, html, text };
}
