export function buildVerificationEmail(firstName, verificationUrl) {
    const subject = "Verify your TellMD account";
    const text = [
        `Hi ${firstName},`,
        "",
        "Thanks for signing up for TellMD. Please verify your email address by visiting the link below:",
        "",
        verificationUrl,
        "",
        "This link expires in 24 hours.",
        "",
        "If you did not create an account, you can safely ignore this email.",
    ].join("\n");
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 8px;">Verify your TellMD account</h2>
      <p>Hi ${firstName},</p>
      <p>Thanks for signing up for TellMD. Please verify your email address to activate your account.</p>
      <p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
      <p style="color: #6b7280; font-size: 14px;">If you did not create an account, you can safely ignore this email.</p>
    </div>
  `.trim();
    return { subject, html, text };
}
//# sourceMappingURL=email.templates.js.map