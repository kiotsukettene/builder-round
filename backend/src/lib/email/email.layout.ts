export const EMAIL_COLORS = {
  background: "#ffffff",
  pageBackground: "#f4f4f5",
  foreground: "#1a1a1a",
  muted: "#737373",
  border: "#ebebeb",
  primary: "#1a1a1a",
  primaryForeground: "#ffffff",
} as const;

export const EMAIL_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const EMAIL_MAX_WIDTH = 600;
export const EMAIL_RADIUS = "10px";
export const EMAIL_TAGLINE =
  "Tell us your symptoms. We connect you to the right doctor.";

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

export interface WrapEmailBodyOptions {
  preheader: string;
  title: string;
  contentHtml: string;
}

export function wrapEmailBody({
  preheader,
  title,
  contentHtml,
}: WrapEmailBodyOptions): string {
  const year = new Date().getFullYear();
  const safePreheader = escapeHtml(preheader);
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_COLORS.pageBackground}; font-family: ${EMAIL_FONT_STACK}; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${safePreheader}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${EMAIL_COLORS.pageBackground};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${EMAIL_MAX_WIDTH}" style="max-width: ${EMAIL_MAX_WIDTH}px; width: 100%;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; color: ${EMAIL_COLORS.foreground}; line-height: 1.2;">
                TellMD
              </p>
              <p style="margin: 8px 0 0; font-size: 14px; color: ${EMAIL_COLORS.muted}; line-height: 1.5;">
                ${EMAIL_TAGLINE}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: ${EMAIL_COLORS.background}; border: 1px solid ${EMAIL_COLORS.border}; border-radius: ${EMAIL_RADIUS}; padding: 32px 28px;">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: ${EMAIL_COLORS.muted}; line-height: 1.5;">
                &copy; ${year} TellMD
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export interface EmailButtonOptions {
  href: string;
  label: string;
}

export function buildEmailButton({ href, label }: EmailButtonOptions): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
  <tr>
    <td align="center">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height: 44px; v-text-anchor: middle; width: 200px;" arcsize="23%" strokecolor="${EMAIL_COLORS.primary}" fillcolor="${EMAIL_COLORS.primary}">
        <w:anchorlock/>
        <center style="color: ${EMAIL_COLORS.primaryForeground}; font-family: ${EMAIL_FONT_STACK}; font-size: 14px; font-weight: 600;">
          ${safeLabel}
        </center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${safeHref}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.primaryForeground}; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: ${EMAIL_RADIUS}; line-height: 1.25; mso-padding-alt: 0;">
        ${safeLabel}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`.trim();
}
