export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}
export interface EmailProvider {
    send(options: SendEmailOptions): Promise<void>;
}
export interface VerificationEmailParams {
    to: string;
    firstName: string;
    token: string;
}
//# sourceMappingURL=email.types.d.ts.map